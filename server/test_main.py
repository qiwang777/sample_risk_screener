import unittest
import json
from main import app, save_securities_data, save_metrics_data
import pandas as pd
import os

class TestMain(unittest.TestCase):
    def setUp(self):
        self.app = app.test_client()
        self.app.testing = True

        # Create test data directories and files
        os.makedirs('./data', exist_ok=True)
        self.securities_test_data = pd.DataFrame([
            {'SecurityId': '123', 'AsOfDate': '2023-10-01', 'Description': 'Test Security', 'Sector': 'Finance', 'Subsector': 'Banking', 'Currency': 'USD'}
        ])
        save_securities_data(self.securities_test_data)

        self.metrics_test_data = pd.DataFrame([
            {'SecurityId': '123', 'MetricName': 'Yield', 'MetricValue': 5.0, 'AsOfDateTime': '2023-10-01T12:00:00'}
        ])
        save_metrics_data(self.metrics_test_data)

    def tearDown(self):
        # Clean up test data files
        if os.path.exists('./data/securities.csv'):
            os.remove('./data/securities.csv')
        if os.path.exists('./data/metrics.csv'):
            os.remove('./data/metrics.csv')

    def test_get_securities(self):
        response = self.app.get('/securities?date=2023-10-01')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]['SecurityId'], 123)

    def test_create_security(self):
        new_security = {
            'SecurityId': '456',
            'AsOfDate': '2023-10-02',
            'Description': 'New Security',
            'Sector': 'Technology',
            'Subsector': 'Software',
            'Currency': 'EUR'
        }
        response = self.app.post('/securities/addSecurity', json=new_security)
        self.assertEqual(response.status_code, 201)
        data = json.loads(response.data)
        self.assertEqual(data['message']['SecurityId'], '456')

    def test_get_metrics(self):
        response = self.app.get('/metrics?date=2023-10-01')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]['MetricName'], 'Yield')

    def test_create_metric(self):
        new_metric = {
            'SecurityId': '123',
            'MetricName': 'Price',
            'MetricValue': 100.0,
            'AsOfDateTime': '2023-10-01T15:00:00'
        }
        response = self.app.post('/metrics/addMetrics', json=new_metric)
        self.assertEqual(response.status_code, 201)
        data = json.loads(response.data)
        self.assertEqual(data['message'], 'Metric created')

if __name__ == '__main__':
    unittest.main()