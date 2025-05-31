import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MetricsCrudForm } from "./MetricsCrud";

describe("MetricsCrudForm", () => {
    const defaultMetric = {
        AsOfDateTime: "",
        SecurityId: "",
        MetricName: "",
        MetricValue: "",
    };

    let setNewMetric: jest.Mock;
    let handleCreateMetric: jest.Mock;

    beforeEach(() => {
        setNewMetric = jest.fn();
        handleCreateMetric = jest.fn();
    });

    it("renders all input fields and the create button", () => {
        render(
            <MetricsCrudForm
                newMetric={defaultMetric}
                setNewMetric={setNewMetric}
                handleCreateMetric={handleCreateMetric}
                // The following props are not used in the form, but required by type
                deleteMetricName={null as any}
                setDeleteMetricName={jest.fn()}
                handleDeleteMetric={jest.fn()}
                deleteSecurityId={null as any}
                setDeleteSecurityId={jest.fn()}
            />
        );

        expect(screen.getByPlaceholderText("AsOfDateTime")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("SecurityId")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("MetricName")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("MetricValue")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /create/i })).toBeInTheDocument();
    });

    it("calls setNewMetric with updated value on input change", () => {
        render(
            <MetricsCrudForm
                newMetric={defaultMetric}
                setNewMetric={setNewMetric}
                handleCreateMetric={handleCreateMetric}
                deleteMetricName={null as any}
                setDeleteMetricName={jest.fn()}
                handleDeleteMetric={jest.fn()}
                deleteSecurityId={null as any}
                setDeleteSecurityId={jest.fn()}
            />
        );

        const metricNameInput = screen.getByPlaceholderText("MetricName");
        fireEvent.change(metricNameInput, { target: { value: "TestMetric" } });

        expect(setNewMetric).toHaveBeenCalledWith({
            ...defaultMetric,
            MetricName: "TestMetric",
        });
    });

    it("calls handleCreateMetric when create button is clicked", () => {
        render(
            <MetricsCrudForm
                newMetric={defaultMetric}
                setNewMetric={setNewMetric}
                handleCreateMetric={handleCreateMetric}
                deleteMetricName={null as any}
                setDeleteMetricName={jest.fn()}
                handleDeleteMetric={jest.fn()}
                deleteSecurityId={null as any}
                setDeleteSecurityId={jest.fn()}
            />
        );

        const createButton = screen.getByRole("button", { name: /create/i });
        fireEvent.click(createButton);

        expect(handleCreateMetric).toHaveBeenCalled();
    });

    it("renders input of type datetime-local for AsOfDateTime", () => {
        render(
            <MetricsCrudForm
                newMetric={defaultMetric}
                setNewMetric={setNewMetric}
                handleCreateMetric={handleCreateMetric}
                deleteMetricName={null as any}
                setDeleteMetricName={jest.fn()}
                handleDeleteMetric={jest.fn()}
                deleteSecurityId={null as any}
                setDeleteSecurityId={jest.fn()}
            />
        );

        const asOfDateTimeInput = screen.getByPlaceholderText("AsOfDateTime");
        expect(asOfDateTimeInput).toHaveAttribute("type", "datetime-local");
    });
});