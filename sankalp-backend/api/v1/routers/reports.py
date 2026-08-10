from fastapi import APIRouter, Depends
from fastapi.responses import Response
from services.report_service import report_service
from middleware.auth_middleware import require_supervisor
from datetime import date

router = APIRouter(prefix="/reports", tags=["Reports"])


@router.post("/generate", summary="Generate a report")
async def generate_report(
    filters: dict,
    supervisor: dict = Depends(require_supervisor),
):
    report_type = filters.get("type", "today")
    return await report_service.generate_report(report_type, filters, supervisor)


@router.post("/export-csv", summary="Export attendance report as CSV")
async def export_csv(
    filters: dict,
    _: dict = Depends(require_supervisor),
):
    """Returns a downloadable CSV file."""
    report_type = filters.get("type", "today")
    csv_bytes = await report_service.export_csv(report_type, filters)

    filename = f"sankalp_{report_type}_{date.today().isoformat()}.csv"
    return Response(
        content=csv_bytes,
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get("", summary="Get list of generated reports")
async def get_reports(_: dict = Depends(require_supervisor)):
    # Returns metadata list (no persistent storage in this version)
    return []
