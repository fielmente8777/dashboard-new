import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { mediaApi, useConfirmImportMutation, useScanImportMutation } from "../../../redux/api/mediaApi";
import { BUSY, IN_REVIEW } from "./reviewConstants";

const fetchOnce = (dispatch, endpoint, arg) =>
  dispatch(mediaApi.endpoints[endpoint].initiate(arg, { forceRefetch: true, subscribe: false })).unwrap();

/** Only the fields the client actually changed (the server lets the AI fill the rest). */
const editPayload = (asset, e = {}) => {
  const out = {};
  if (e.title !== undefined && e.title.trim() && e.title !== asset.title) out.title = e.title.trim();
  if (e.description !== undefined) out.description = e.description;
  if (e.roomIdentifier !== undefined) out.roomIdentifier = e.roomIdentifier;
  if (e.category) out.category = e.category;
  if (e.subCategory !== undefined) out.subCategory = e.subCategory || null;
  if (e.tags) out.tags = e.tags;
  if (e.rotate) out.rotate = e.rotate;
  if (e.crop) out.crop = e.crop;
  return out;
};

// State of one review: the imports (one per link), their staged images,
// what is selected and what was edited.
export default function useReviewSession(jobIds, draftId) {
  const dispatch = useDispatch();
  const [jobs, setJobs] = useState({});
  const [assets, setAssets] = useState([]);
  const [creditsPerImage, setCreditsPerImage] = useState(0);
  const [selected, setSelected] = useState(() => new Set());
  const [edits, setEdits] = useState({});
  const loaded = useRef({}); // jobId -> status its images were loaded at
  const [scanImport] = useScanImportMutation();
  const [confirmImport, { isLoading: confirming }] = useConfirmImportMutation();

  const loadReview = useCallback(
    async (job) => {
      const data = await fetchOnce(dispatch, "getImportReview", job.id);
      loaded.current[job.id] = job.status;
      setCreditsPerImage(data.creditsPerImage || 0);
      const mine = data.assets.map((a) => ({ ...a, jobId: job.id }));
      setAssets((all) => [...all.filter((a) => a.jobId !== job.id), ...mine]);
      // default selection: everything, or what the AI scan says matches
      setSelected((s) => {
        const next = new Set([...s].filter((id) => !mine.some((a) => a.id === id)));
        mine.forEach((a) => (!a.scan || a.scan.verdict === "include") && next.add(a.id));
        return next;
      });
    },
    [dispatch],
  );

  // poll the jobs until each waits for review or is finished
  useEffect(() => {
    let stop = false;
    const tick = async () => {
      const list = await Promise.all(jobIds.map((id) => fetchOnce(dispatch, "getMediaImport", id).catch(() => null)));
      if (stop) return;
      setJobs(Object.fromEntries(list.filter(Boolean).map((j) => [j.id, j])));
      await Promise.all(list.filter((j) => j && IN_REVIEW.includes(j.status) && loaded.current[j.id] !== j.status).map(loadReview));
    };
    tick();
    const timer = setInterval(tick, 1500);
    return () => {
      stop = true;
      clearInterval(timer);
    };
  }, [jobIds, dispatch, loadReview]);

  const jobList = Object.values(jobs);
  const phase = useMemo(() => {
    if (jobList.length < jobIds.length || jobList.some((j) => BUSY.includes(j.status))) return "busy";
    if (jobList.some((j) => IN_REVIEW.includes(j.status))) return "review";
    return "finished";
  }, [jobList, jobIds.length]);
  const scanned = jobList.some((j) => j.status === "scanned");

  const toggle = (id) =>
    setSelected((s) => {
      const next = new Set(s);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  const setMany = (ids, on) =>
    setSelected((s) => {
      const next = new Set(s);
      ids.forEach((id) => (on ? next.add(id) : next.delete(id)));
      return next;
    });
  const setEdit = (id, patch) => setEdits((e) => ({ ...e, [id]: { ...e[id], ...patch } }));

  const reviewJobs = () => jobList.filter((j) => IN_REVIEW.includes(j.status));

  const scan = (brief) => Promise.all(reviewJobs().map((j) => scanImport({ id: j.id, ...brief }).unwrap()));

  const send = (isIncluded) =>
    Promise.all(
      reviewJobs().map((j) =>
        confirmImport({
          id: j.id,
          draftId,
          items: assets
            .filter((a) => a.jobId === j.id)
            .map((a) => ({ assetId: a.id, include: isIncluded(a), ...(isIncluded(a) ? editPayload(a, edits[a.id]) : {}) })),
        }).unwrap(),
      ),
    );
  const confirm = () => send((a) => selected.has(a.id));
  // discard: nothing included, so the server deletes every preview
  const confirmNone = () => send(() => false);

  return { jobs: jobList, assets, phase, scanned, selected, edits, creditsPerImage, confirming, toggle, setMany, setEdit, scan, confirm, confirmNone };
}
