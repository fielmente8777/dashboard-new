import { Download, Plus, RefreshCw, Trash2, Upload } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import FollowUpDialog from "../../components/FollowUpDialog";
import Pagination from "../../components/Pagination";
import TablePaginationInfo from "../../components/TablePaginationInfo";
import Button from "../../components/ui/Button";
import DateRange from "../../components/ui/DateRange";
import CustomDropdown from "../../components/ui/Dropdown";
import { Input } from "../../components/ui/Field";
import PageShell from "../../components/ui/PageShell";
import { ErrorState } from "../../components/ui/States";
import Tabs from "../../components/ui/Tabs";
import { useConfirm } from "../../context/ConfirmContext";
import { useToast } from "../../context/ToastContext";
import { Sources, Stages } from "../../data/constant";
import { useApiAction } from "../../hooks/useApiAction";
import useDebounce from "../../hooks/useDebounce";
import { useTenant } from "../../hooks/useTenant";
import { useGetTeamUsersQuery } from "../../redux/api/callsApi";
import {
  useDeleteLeadsMutation,
  useExportLeadsMutation,
  useGetLeadsQuery,
  useSyncMetaLeadsMutation,
  useUpdateLeadMutation,
} from "../../redux/api/leadsApi";
import { leadViewPath } from "../../routes/paths";
import AddLeadDialog from "./components/AddLeadDialog";
import ExportLeadsDialog from "./components/ExportLeadsDialog";
import ImportLeadsDialog from "./components/ImportLeadsDialog";
import LeadsTable from "./components/LeadsTable";
import { useLeadFilters } from "./hooks/useLeadFilters";
import { useNewLeadRefresh } from "./hooks/useNewLeadRefresh";
import { MAX_SELECTED_LEADS, NOTES_FILTERS } from "./leadSources";
import { exportLeadsToCsv, toApiDate } from "./leadUtils";

const STAGE_OPTIONS = [{ value: "", label: "All stages" }, ...Stages];

// A leads list page. `source` is one entry of LEAD_SOURCES: it says which
// leads the page shows and which columns, filters and actions it has.
const LeadsList = ({ source }) => {
  const navigate = useNavigate();
  const { confirm } = useConfirm();
  const { showToast } = useToast();
  const run = useApiAction();
  const tenant = useTenant();
  const { hid } = tenant;

  const [filters, setFilters] = useLeadFilters();
  const { page, limit } = filters;
  const [searchText, setSearchText] = useState(filters.search);
  const search = useDebounce(searchText.trim(), 400);

  const [selectedIds, setSelectedIds] = useState([]);
  // one piece of state per dialog
  const [dialog, setDialog] = useState(null); // "add" | "import" | "export"
  const [followUpLead, setFollowUpLead] = useState(null);

  const query = {
    hid,
    page,
    limit,
    search: filters.search,
    stage: filters.stage,
    source: filters.source,
    notes: filters.notes,
    createdFrom: source.createdFrom,
    from: toApiDate(filters.from),
    to: toApiDate(filters.to),
  };
  const leads = useGetLeadsQuery(query, {
    skip: !hid,
    refetchOnMountOrArgChange: true,
  });
  const users = useGetTeamUsersQuery();
  const [updateLead] = useUpdateLeadMutation();
  const [deleteLeads, { isLoading: isDeleting }] = useDeleteLeadsMutation();
  const [exportLeads, { isLoading: isExporting }] = useExportLeadsMutation();
  const [syncMetaLeads, { isLoading: isSyncing }] = useSyncMetaLeadsMutation();

  useNewLeadRefresh(tenant, Boolean(source.live));

  const rows = leads.currentData?.leads || [];
  const total = leads.currentData?.total || 0;
  const campaigns = leads.data?.campaigns || [];
  const totalPages = Math.ceil(total / limit);

  // the typed search reaches the URL (and so the request) once typing pauses
  useEffect(() => {
    if (search !== filters.search) setFilters({ search });
    // only a new search term should run this, not every filter change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  // leads that are no longer on the page cannot stay selected
  useEffect(() => {
    const visibleIds = (leads.currentData?.leads || []).map((lead) => lead._id);
    setSelectedIds((ids) => ids.filter((id) => visibleIds.includes(id)));
  }, [leads.currentData]);

  const handleUpdate = useCallback(
    (lead, changes) =>
      run(
        updateLead({
          hid: lead.hId,
          leadId: lead._id,
          ...(lead.conversationId && { conversationId: lead.conversationId }),
          ...changes,
        }),
        { success: "Lead updated", error: "Could not update the lead." },
      ),
    [run, updateLead],
  );

  const handleStageChange = useCallback(
    (lead, stage) => {
      // a follow up also needs a date, which the dialog asks for
      if (stage === "Follow Up") setFollowUpLead(lead);
      else handleUpdate(lead, { status: stage, followUpDate: null });
    },
    [handleUpdate],
  );

  const handleTurnAway = useCallback(
    (lead, turnAwayCode) =>
      handleUpdate(lead, {
        status: "Turn Away",
        followUpDate: null,
        turnAwayCode,
      }),
    [handleUpdate],
  );

  const handleAssign = useCallback(
    (lead, user) =>
      handleUpdate(lead, {
        assignee: user.userName,
        assigneeNumber: user.phone || null,
        assigneeEmail: user.emailId || null,
      }),
    [handleUpdate],
  );

  const handleToggleSelect = useCallback(
    (lead) => {
      if (selectedIds.includes(lead._id)) {
        setSelectedIds(selectedIds.filter((id) => id !== lead._id));
      } else if (selectedIds.length < MAX_SELECTED_LEADS) {
        setSelectedIds([...selectedIds, lead._id]);
      } else {
        showToast({
          message: `You can select up to ${MAX_SELECTED_LEADS} leads at a time.`,
          type: "error",
        });
      }
    },
    [selectedIds, showToast],
  );

  const handleDelete = async () => {
    const count = selectedIds.length;
    const confirmed = await confirm(
      `Delete ${count} ${count === 1 ? "lead" : "leads"}? This cannot be undone.`,
      { title: "Delete leads" },
    );
    if (!confirmed) return;

    await run(deleteLeads(selectedIds), {
      success: count === 1 ? "Lead deleted" : `${count} leads deleted`,
      error: "Could not delete the leads.",
    });
  };

  // `period` ({ from, to } as Dates) comes from the export dialog, on the
  // pages that ask for one; those also export with the filters in use.
  const handleExport = async (period) => {
    const exported = await run(
      exportLeads({
        hid,
        createdFrom: source.createdFrom,
        ...(period && {
          stage: filters.stage,
          source: filters.source,
          from: period.from?.toISOString(),
          to: period.to?.toISOString(),
        }),
      }),
      { error: "Could not export the leads." },
    );
    if (!exported) return;

    if (exported.length === 0) {
      showToast({ message: "There are no leads to export.", type: "error" });
      return;
    }
    exportLeadsToCsv(exported, source.title);
  };

  const handleOpen = (lead, position) => {
    // `lead` is the position in the list, used by Prev / Next on the lead page
    const hasDateRange = Boolean(filters.from && filters.to);
    const viewQuery = {
      hid: lead.hId,
      lead: position,
      created_from: source.createdFrom,
      search: filters.search,
      stage: filters.stage,
      source: filters.source.join(","),
      startDate: hasDateRange ? query.from : "",
      endDate: hasDateRange ? query.to : "",
    };
    navigate(leadViewPath(lead._id, { hid, query: viewQuery }));
  };

  return (
    <PageShell
      title={source.title}
      description={source.description}
      actions={
        <>
          {rows.length > 0 && (
            <Button
              variant="secondary"
              icon={Download}
              loading={isExporting}
              onClick={() =>
                source.exportNeedsOtp ? setDialog("export") : handleExport()
              }
            >
              Export
            </Button>
          )}
          {source.canImport && (
            <Button
              variant="secondary"
              icon={Upload}
              onClick={() => setDialog("import")}
            >
              Import CSV
            </Button>
          )}
          {source.canSync && (
            <Button
              variant="secondary"
              icon={RefreshCw}
              loading={isSyncing}
              onClick={() =>
                run(syncMetaLeads(hid), {
                  success: "Leads refreshed",
                  error: "Could not refresh the leads.",
                })
              }
            >
              Refresh
            </Button>
          )}
          {source.canAdd && (
            <Button icon={Plus} onClick={() => setDialog("add")}>
              Add lead
            </Button>
          )}
        </>
      }
    >
      <div className="flex flex-wrap items-center gap-3">
        <div className="w-full sm:w-64">
          <Input
            type="search"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search leads..."
            aria-label="Search leads"
          />
        </div>
        <DateRange
          from={filters.from}
          to={filters.to}
          onChange={setFilters}
        />
        {source.sourceFilter && (
          <div className="w-full sm:w-56">
            <CustomDropdown
              multiple
              label={filters.source}
              options={Sources}
              onChange={(value) => setFilters({ source: value })}
            />
          </div>
        )}
        <div className="w-full sm:w-48">
          <CustomDropdown
            label={filters.stage}
            options={STAGE_OPTIONS}
            onChange={(stage) => setFilters({ stage })}
          />
        </div>
        {source.campaignFilter && campaigns.length > 0 && (
          <div className="w-full sm:w-56">
            <CustomDropdown
              // goes back to "All campaigns" when the search is changed by hand
              key={campaigns.includes(searchText) ? searchText : "all"}
              label={campaigns.includes(searchText) ? searchText : ""}
              options={[
                { value: "", label: "All campaigns" },
                ...campaigns.map((name) => ({ value: name, label: name })),
              ]}
              // a campaign is found by searching for its name
              onChange={setSearchText}
            />
          </div>
        )}
        <Tabs
          tabs={NOTES_FILTERS}
          value={filters.notes}
          onChange={(notes) => setFilters({ notes })}
        />
      </div>

      {selectedIds.length > 0 && (
        <div>
          <Button
            variant="danger"
            size="sm"
            icon={Trash2}
            loading={isDeleting}
            onClick={handleDelete}
          >
            Delete {selectedIds.length} selected
          </Button>
        </div>
      )}

      {leads.isError ? (
        <ErrorState
          message="Could not load the leads."
          onRetry={leads.refetch}
        />
      ) : (
        <LeadsTable
          leads={rows}
          columnKeys={source.columns}
          users={users.data || []}
          loading={!leads.currentData}
          firstIndex={(page - 1) * limit}
          pageSize={limit}
          selectedIds={selectedIds}
          onOpen={handleOpen}
          onStageChange={handleStageChange}
          onTurnAway={handleTurnAway}
          onAssign={handleAssign}
          onToggleSelect={handleToggleSelect}
        />
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={(value) => setFilters({ page: value })}
          onPrev={() => setFilters({ page: page - 1 })}
          onNext={() => setFilters({ page: page + 1 })}
        />
        <TablePaginationInfo
          page={page}
          limit={limit}
          total={total}
          onLimitChange={(value) => setFilters({ limit: value })}
        />
      </div>

      <FollowUpDialog
        open={Boolean(followUpLead)}
        description="Pick the date and time to follow up with this lead."
        onClose={() => setFollowUpLead(null)}
        onSave={(date) => {
          handleUpdate(followUpLead, {
            status: "Follow Up",
            followUpDate: date.toISOString(),
          });
          setFollowUpLead(null);
        }}
      />
      <AddLeadDialog open={dialog === "add"} onClose={() => setDialog(null)} />
      <ImportLeadsDialog
        open={dialog === "import"}
        onClose={() => setDialog(null)}
      />
      <ExportLeadsDialog
        open={dialog === "export"}
        onClose={() => setDialog(null)}
        onExport={handleExport}
      />
    </PageShell>
  );
};

export default LeadsList;
