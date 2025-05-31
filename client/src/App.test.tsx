import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import App from "./App";

// Mock child components
jest.mock("./components/SecuritiesCrud", () => ({
    SecuritiesCrudForm: (props: any) => (
        <div data-testid="securities-crud-form" {...props} />
    ),
}));
jest.mock("./components/MetricsCrud", () => ({
    MetricsCrudForm: (props: any) => (
        <div data-testid="metrics-crud-form" {...props} />
    ),
}));

// Mock AgGridReact
jest.mock("ag-grid-react", () => ({
    AgGridReact: (props: any) => (
        <div data-testid="ag-grid-react" {...props}>
            {JSON.stringify(props.rowData)}
        </div>
    ),
}));

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch as any;

describe("App", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockFetch.mockImplementation((url: string) => {
            if (url.startsWith("http://localhost:5000/securities")) {
                return Promise.resolve({
                    json: () => Promise.resolve([{ SecurityId: "SEC1", AsOfDate: "2024-01-01" }]),
                });
            }
            if (url.startsWith("http://localhost:5000/metrics")) {
                return Promise.resolve({
                    json: () => Promise.resolve([{ MetricName: "Yield", SecurityId: "SEC1" }]),
                });
            }
            return Promise.resolve({
                json: () => Promise.resolve([]),
            });
        });
    });

    it("renders input, buttons, and grids", async () => {
        render(<App />);
        expect(screen.getByPlaceholderText("YYYY-MM-DD")).toBeInTheDocument();
        expect(screen.getByText("Fetch Securities and Metrics by Date")).toBeInTheDocument();
        expect(screen.getByText("Securities Data")).toBeInTheDocument();
        expect(screen.getByText("Metrics (Most Recent Version for Each Security)")).toBeInTheDocument();
        expect(screen.getAllByTestId("ag-grid-react").length).toBe(2);
        expect(screen.getByTestId("securities-crud-form")).toBeInTheDocument();
        expect(screen.getByTestId("metrics-crud-form")).toBeInTheDocument();
        await waitFor(() => {
            expect(mockFetch).toHaveBeenCalledWith("http://localhost:5000/securities");
            expect(mockFetch).toHaveBeenCalledWith("http://localhost:5000/metrics");
        });
    });

    it("fetches data by date when button is clicked", async () => {
        render(<App />);
        const dateInput = screen.getByPlaceholderText("YYYY-MM-DD");
        fireEvent.change(dateInput, { target: { value: "2024-06-01" } });
        const button = screen.getByText("Fetch Securities and Metrics by Date");
        fireEvent.click(button);
        await waitFor(() => {
            expect(mockFetch).toHaveBeenCalledWith(
                "http://localhost:5000/securities?date=2024-06-01"
            );
            expect(mockFetch).toHaveBeenCalledWith(
                "http://localhost:5000/metrics?date=2024-06-01"
            );
        });
    });

    it("shows alert if required fields are missing when creating security", async () => {
        window.alert = jest.fn();
        render(<App />);
        // Find SecuritiesCrudForm and call handleCreateSecurity
        const form = screen.getByTestId("securities-crud-form");
        // @ts-ignore
        form.props.handleCreateSecurity();
        expect(window.alert).toHaveBeenCalledWith(
            expect.stringContaining("The following fields are required")
        );
    });

    it("shows alert if required fields are missing when creating metric", async () => {
        window.alert = jest.fn();
        render(<App />);
        // Find MetricsCrudForm and call handleCreateMetric
        const form = screen.getByTestId("metrics-crud-form");
        // @ts-ignore
        form.props.handleCreateMetric();
        expect(window.alert).toHaveBeenCalledWith(
            expect.stringContaining("The following fields are required")
        );
    });

    it("shows alert if required fields are missing when deleting security", async () => {
        window.alert = jest.fn();
        render(<App />);
        const form = screen.getByTestId("securities-crud-form");
        // @ts-ignore
        form.props.handleDeleteSecurity("", "");
        expect(window.alert).toHaveBeenCalledWith(
            "Both Security ID and Date are required to delete a security."
        );
    });

    it("shows alert if required fields are missing when deleting metric", async () => {
        window.alert = jest.fn();
        render(<App />);
        const form = screen.getByTestId("metrics-crud-form");
        // @ts-ignore
        form.props.handleDeleteMetric();
        expect(window.alert).toHaveBeenCalledWith(
            "Both Metric Name and Security ID are required to delete a metric."
        );
    });
});