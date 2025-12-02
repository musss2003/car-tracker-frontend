// src/features/cars/services/carCarIssueReportService.ts

import { getAuthHeaders } from "@/shared/utils/getAuthHeaders";
import { CarIssueReport, CreateCarIssueReportPayload, UpdateCarIssueReportPayload } from "../types/car.types";


const API_URL = import.meta.env.VITE_API_BASE_URL + '/api/';

const BASE_PATH= `${API_URL}car-issue-report`;


async function handleResponse<T>(res: Response): Promise<T> {
    const text = await res.text();
    const data = text ? JSON.parse(text) : null;
    if (!res.ok) {
        const msg = data?.message || data?.error || res.statusText || 'Request failed';
        throw new Error(msg);
    }
    return data as T;
}

export async function createCarIssueReport(
    payload: CreateCarIssueReportPayload,
): Promise<CarIssueReport> {
    const res = await fetch(`${BASE_PATH}/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
    });
    return handleResponse<CarIssueReport>(res);
}

export async function getAllCarIssueReports(): Promise<CarIssueReport[]> {
    const res = await fetch(`${BASE_PATH}/`, {
        method: 'GET',
        headers: getAuthHeaders(),
    });
    return handleResponse<CarIssueReport[]>(res);
}

export async function getCarIssueReportsForCar(carId: string): Promise<CarIssueReport[]> {
    const res = await fetch(`${BASE_PATH}/car/${encodeURIComponent(carId)}`, {
        method: 'GET',
        headers: getAuthHeaders(),
    });
    return handleResponse<CarIssueReport[]>(res);
}

export async function getSingleCarIssueReport(id: string): Promise<CarIssueReport> {
    const res = await fetch(`${BASE_PATH}/${encodeURIComponent(id)}`, {
        method: 'GET',
        headers: getAuthHeaders(),
    });
    return handleResponse<CarIssueReport>(res);
}

export async function updateCarIssueReportStatus(
    id: string,
    payload: UpdateCarIssueReportPayload,
): Promise<CarIssueReport> {
    const res = await fetch(`${BASE_PATH}/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
    });
    return handleResponse<CarIssueReport>(res);
}

export async function deleteCarIssueReport(id: string): Promise<{ success: boolean; id?: string }> {
    const res = await fetch(`${BASE_PATH}/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    });
    return handleResponse<{ success: boolean; id?: string }>(res);
}

export async function getNewIssueReports(): Promise<CarIssueReport[]> {
    const res = await fetch(`${BASE_PATH}/reports/new`, {
        method: 'GET',
        headers: getAuthHeaders(),
    });
    return handleResponse<CarIssueReport[]>(res);
}

export async function getNewIssueReportsByCar(carId: string): Promise<CarIssueReport[]> {
    const res = await fetch(`${BASE_PATH}/car/${encodeURIComponent(carId)}/new`, {
        method: 'GET',
        headers: getAuthHeaders(),
    });
    return handleResponse<CarIssueReport[]>(res);
}

export async function getIssueReportAuditLogs(
    issueReportId: string,
    page: number = 1,
    limit: number = 50
): Promise<{
    success: boolean;
    data: any[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
}> {
    const res = await fetch(
        `${BASE_PATH}/${encodeURIComponent(issueReportId)}/audit-logs?page=${page}&limit=${limit}`,
        {
            method: 'GET',
            headers: getAuthHeaders(),
        }
    );
    return handleResponse<{
        success: boolean;
        data: any[];
        pagination: { page: number; limit: number; total: number; totalPages: number };
    }>(res);
}