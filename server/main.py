from flask import Flask, request, jsonify
from flask_cors import CORS
from gevent.pywsgi import WSGIServer
import pandas as pd
import os

app = Flask(__name__)
CORS(app, origins=["http://localhost:5173"])

SECURITIES_PATH = './data/securities.csv'
METRICS_PATH = './data/metrics.csv'

def get_securities_data():
    if not os.path.exists(SECURITIES_PATH):
        return pd.DataFrame(columns=['SecurityId', 'AsOfDate', 'Description', 'Sector', 'Subsector', 'Currency'])
    return pd.read_csv(SECURITIES_PATH)

def save_securities_data(df):
    df.to_csv(SECURITIES_PATH, index=False)

def get_metrics_data():
    return pd.read_csv(METRICS_PATH)

def save_metrics_data(df):
    df.to_csv(METRICS_PATH, index=False)

# --- SECURITIES CRUD ---

@app.route('/securities', methods=['GET'])
def get_securities():
    date = request.args.get('date')
    securities = get_securities_data()
    if date:
        securities = securities[securities['AsOfDate'] == date]
    return jsonify(securities.to_dict(orient='records'))

# / Create a new security (securityId is required, AsOfDate is optional)
# /securities/addSecurity?SecurityId=123&AsOfDate=2023-10-01
@app.route('/securities/addSecurity', methods=['POST'])
def create_security():
    data = request.json
    required_fields = ['AsOfDate', 'SecurityId', 'Description', 'Sector', 'Subsector', 'Currency']
    for field in required_fields:
        if field not in data or data[field] in (None, ''):
            return jsonify({"error": f"Missing required field: {field}"}), 400

    as_of_date = request.args.get('AsOfDate') or pd.Timestamp.today().strftime('%Y-%m-%d')
    data['AsOfDate'] = as_of_date

    df = get_securities_data()

    exists = not df[(df['SecurityId'] == data['SecurityId']) & (df['AsOfDate'] == as_of_date)].empty
    if exists:
        return jsonify({"error": "Security with this SecurityId and AsOfDate already exists"}), 400

    df = pd.concat([df, pd.DataFrame([data])], ignore_index=True)
    print(f"Creating security: {data}")
    save_securities_data(df)
    return jsonify({"message": data}), 201

# /deleteSecurity?SecurityId=123&AsOfDate=2023-10-01
@app.route('/securities/deleteMetrics/<security_id>/<as_of_date>', methods=['DELETE'])
def delete_security(security_id, as_of_date):
    df = get_securities_data()
    new_df = df[~((df['SecurityId'] == security_id) & (df['AsOfDate'] == as_of_date))]
    if len(new_df) == len(df):
        return jsonify({"error": "Security not found"}), 404
    save_securities_data(new_df)
    return jsonify({"message": "Security deleted"})

# --- METRICS CRUD ---

@app.route('/metrics', methods=['GET'])
def get_metrics():
    date = request.args.get('date')
    security_id = request.args.get('securityId')
    metrics = get_metrics_data()
    if date:
        metrics['AsOfDateTime'] = pd.to_datetime(metrics['AsOfDateTime'])
        metrics = metrics[metrics['AsOfDateTime'].dt.date == pd.to_datetime(date).date()]
        metrics = metrics.sort_values('AsOfDateTime').groupby(['SecurityId', 'MetricName'], as_index=False).last()
        metrics['AsOfDateTime'] = metrics['AsOfDateTime'].dt.strftime('%m/%d/%Y %H:%M')
    if security_id:
        metrics = metrics[metrics['SecurityId'] == security_id]
    return metrics.to_dict(orient='records')

# / Create a new metric (AsOfDateTime is required)
# /metrics/addMetrics?AsOfDateTime=2023-10-01T12:00:00&SecurityId=123&MetricName=Yield&MetricValue=5.0
@app.route('/metrics/addMetrics', methods=['POST'])
def create_metric():
    data = request.json
    if 'AsOfDateTime' not in data or data['AsOfDateTime'] in (None, ''):
        return jsonify({"error": "Missing required field: AsOfDateTime"}), 400
    try:
        data['AsOfDateTime'] = pd.to_datetime(data['AsOfDateTime']).strftime('%m/%d/%Y %H:%M')
    except ValueError:
        return jsonify({"error": "Invalid date format. Use M/D/YYYY h:M"}), 400

    df = get_metrics_data()
    df = pd.concat([df, pd.DataFrame([data])], ignore_index=True)
    save_metrics_data(df)
    return jsonify({"message": "Metric created"}), 201

# /deleteMetrics?SecurityId=123&MetricName=Yield&AsOfDateTime=2023-10-01T12:00:00
@app.route('/deleteMetrics', methods=['DELETE'])
def delete_metric():
    data = request.json
    required_fields = ['MetricName', 'SecurityId', 'AsOfDateTime']
    for field in required_fields:
        if field not in data or data[field] in (None, ''):
            return jsonify({"error": f"Missing required field: {field}"}), 400

    metric_name = data['MetricName']
    security_id = data['SecurityId']
    as_of_date_time = pd.to_datetime(data['AsOfDateTime'])

    df = get_metrics_data()
    df['AsOfDateTime'] = pd.to_datetime(df['AsOfDateTime'])
    new_df = df[~((df['MetricName'] == metric_name) & 
                  (df['SecurityId'] == security_id) & 
                  (df['AsOfDateTime'] == as_of_date_time))]
    if len(new_df) == len(df):
        return jsonify({"error": "Metric not found"}), 404

    save_metrics_data(new_df)
    return jsonify({"message": "Metric deleted"})

# --- METRICS ANALYSIS ---
@app.route('/metricsLargestChangeOnYield', methods=['GET'])
def get_security_with_largest_yield_change():
    metrics = get_metrics_data()
    metrics['AsOfDateTime'] = pd.to_datetime(metrics['AsOfDateTime'])

    # Filter only 'Yield' metrics, this can be adjusted to include other metrics if needed
    yield_metrics = metrics[metrics['MetricName'] == 'Yield']

    if yield_metrics.empty:
        return jsonify({"error": "No yield metrics found"}), 404

    # Get the earliest and latest yield for each security
    yield_metrics = yield_metrics.sort_values('AsOfDateTime')
    first_yields = yield_metrics.groupby('SecurityId').first().reset_index()
    last_yields = yield_metrics.groupby('SecurityId').last().reset_index()

    # Merge to calculate the change
    yield_changes = pd.merge(first_yields, last_yields, on='SecurityId', suffixes=('_first', '_last'))
    yield_changes['YieldChange'] = yield_changes['MetricValue_last'].astype(float) - yield_changes['MetricValue_first'].astype(float)

    # Find the security with the largest change
    largest_change = yield_changes.loc[yield_changes['YieldChange'].idxmax()]

    return jsonify({
        "SecurityId": largest_change['SecurityId'],
        "FirstYield": largest_change['MetricValue_first'],
        "LastYield": largest_change['MetricValue_last'],
        "YieldChange": largest_change['YieldChange']
    })

if __name__ == '__main__':
    port_num = 5000
    http_server = WSGIServer(('0.0.0.0', int(port_num)), app)
    http_server.serve_forever()
