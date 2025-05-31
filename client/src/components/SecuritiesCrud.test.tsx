import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { SecuritiesCrudForm } from "./SecuritiesCrud";

describe("SecuritiesCrudForm", () => {
    const defaultSecurity = {
        SecurityId: "",
        AsOfDate: "",
        Description: "",
        Sector: "",
        Subsector: "",
        Currency: "",
    };

    const setup = (overrideSecurity = {}) => {
        const newSecurity = { ...defaultSecurity, ...overrideSecurity };
        const setNewSecurity = jest.fn();
        const handleCreateSecurity = jest.fn();

        render(
            <SecuritiesCrudForm
                newSecurity={newSecurity}
                setNewSecurity={setNewSecurity}
                handleCreateSecurity={handleCreateSecurity}
                // The following props are not used in the form, but required by the type
                deleteSecurityId={null as any}
                setDeleteSecurityId={jest.fn()}
                deleteAsOfDate={null as any}
                setDeleteAsOfDate={jest.fn()}
                handleDeleteSecurity={jest.fn()}
            />
        );
        return { setNewSecurity, handleCreateSecurity };
    };

    it("renders all input fields with correct placeholders", () => {
        setup();
        expect(screen.getByPlaceholderText("SecurityId")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("AsOfDate")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Description")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Sector")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Subsector")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Currency")).toBeInTheDocument();
    });

    it("renders the Create button", () => {
        setup();
        expect(screen.getByRole("button", { name: /create/i })).toBeInTheDocument();
    });

    it("calls setNewSecurity with updated value when input changes", () => {
        const { setNewSecurity } = setup();
        const input = screen.getByPlaceholderText("SecurityId");
        fireEvent.change(input, { target: { value: "ABC123" } });
        expect(setNewSecurity).toHaveBeenCalledWith(
            expect.objectContaining({ SecurityId: "ABC123" })
        );
    });

    it("calls setNewSecurity with updated date when AsOfDate changes", () => {
        const { setNewSecurity } = setup();
        const input = screen.getByPlaceholderText("AsOfDate");
        fireEvent.change(input, { target: { value: "2024-06-01" } });
        expect(setNewSecurity).toHaveBeenCalledWith(
            expect.objectContaining({ AsOfDate: "2024-06-01" })
        );
    });

    it("calls handleCreateSecurity when Create button is clicked", () => {
        const { handleCreateSecurity } = setup();
        const button = screen.getByRole("button", { name: /create/i });
        fireEvent.click(button);
        expect(handleCreateSecurity).toHaveBeenCalled();
    });

    it("inputs reflect values from newSecurity prop", () => {
        setup({ SecurityId: "SEC1", Description: "Test Desc" });
        expect(screen.getByPlaceholderText("SecurityId")).toHaveValue("SEC1");
        expect(screen.getByPlaceholderText("Description")).toHaveValue("Test Desc");
    });


});