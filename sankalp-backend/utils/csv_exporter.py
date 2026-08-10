import csv
import io
from typing import List, Dict, Any
from datetime import datetime


def generate_attendance_csv(records: List[Dict[str, Any]]) -> bytes:
    """
    Generate a UTF-8 CSV file from attendance records.
    Format is Excel-compatible with proper headers.
    """
    output = io.StringIO()
    
    fieldnames = [
        "Worker Name",
        "Worker ID",
        "Village",
        "Department",
        "Date",
        "Time",
        "Status",
        "Confidence (%)",
        "Review Status",
        "Supervisor",
    ]
    
    writer = csv.DictWriter(output, fieldnames=fieldnames, lineterminator="\r\n")
    writer.writeheader()
    
    for record in records:
        writer.writerow({
            "Worker Name": record.get("workerName", ""),
            "Worker ID": record.get("workerId", "").upper(),
            "Village": record.get("village", ""),
            "Department": record.get("department", ""),
            "Date": record.get("date", ""),
            "Time": record.get("time", ""),
            "Status": record.get("status", "").replace("_", " ").title(),
            "Confidence (%)": f"{record.get('confidence', 0):.1f}",
            "Review Status": record.get("reviewStatus", "").replace("_", " ").title(),
            "Supervisor": record.get("supervisorName", ""),
        })
    
    # Return UTF-8 with BOM for Excel compatibility
    return "\ufeff".encode("utf-8") + output.getvalue().encode("utf-8")


def generate_worker_csv(workers: List[Dict[str, Any]]) -> bytes:
    """Generate a CSV file of worker details."""
    output = io.StringIO()
    
    fieldnames = [
        "Worker ID", "Full Name", "Phone", "Village", "Department",
        "Daily Wage (₹)", "Gender", "Age", "Face Enrolled",
        "Attendance (%)", "Present Days", "Expected Monthly Wage (₹)",
        "Registered On",
    ]
    
    writer = csv.DictWriter(output, fieldnames=fieldnames, lineterminator="\r\n")
    writer.writeheader()
    
    for w in workers:
        writer.writerow({
            "Worker ID": w.get("workerId", "").upper(),
            "Full Name": w.get("fullName", ""),
            "Phone": w.get("phone", ""),
            "Village": w.get("village", ""),
            "Department": w.get("department", ""),
            "Daily Wage (₹)": w.get("dailyWage", 0),
            "Gender": w.get("gender", "").title(),
            "Age": w.get("age", ""),
            "Face Enrolled": "Yes" if w.get("faceEnrolled") else "No",
            "Attendance (%)": f"{w.get('attendancePercentage', 0):.1f}",
            "Present Days": w.get("presentDays", 0),
            "Expected Monthly Wage (₹)": w.get("expectedMonthlyWage", 0),
            "Registered On": w.get("createdAt", "")[:10],
        })
    
    return "\ufeff".encode("utf-8") + output.getvalue().encode("utf-8")
