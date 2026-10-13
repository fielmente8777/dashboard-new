import SelectMenu from "../../../components/ui/SelectMenu";
import { ALL } from "../googleAdsUtils";

const Filter = ({
  label,
  query,
  options,
  value,
  onChange,
  disabled,
  allLabel,
}) => {
  const items = [
    ...(allLabel ? [{ value: ALL, label: allLabel }] : []),
    ...options,
  ];
  const placeholder = query.isFetching ? "Loading…" : "None";

  return (
    <label className="flex min-w-0 flex-col gap-1.5">
      <span className="text-xs font-medium text-app-text-muted">{label}</span>
      <SelectMenu
        label={label}
        options={items}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled || query.isFetching || !options.length}
        className="w-full"
      />
    </label>
  );
};

// Account → campaign → ad group → ad. Each one narrows the next.
const AdsFilters = ({
  selection,
  select,
  accounts,
  campaigns,
  adGroups,
  ads,
}) => (
  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
    <Filter
      label="Account"
      query={accounts}
      value={selection.account}
      onChange={select.account}
      options={(accounts.data || []).map((a) => ({
        value: a.clientCustomerId || a.googleAccountId,
        label: a.accountName || a.clientCustomerId,
      }))}
    />
    <Filter
      label="Campaign"
      query={campaigns}
      value={selection.campaign}
      onChange={select.campaign}
      disabled={!selection.account}
      allLabel="All campaigns"
      options={(campaigns.data || []).map((c) => ({
        value: c.campaignId,
        label: c.name,
      }))}
    />
    <Filter
      label="Ad group"
      query={adGroups}
      value={selection.adGroup}
      onChange={select.adGroup}
      disabled={selection.campaign === ALL}
      allLabel="All ad groups"
      options={(adGroups.data || []).map((g) => ({
        value: g.adGroupId,
        label: g.name,
      }))}
    />
    <Filter
      label="Ad"
      query={ads}
      value={selection.ad}
      onChange={select.ad}
      disabled={selection.adGroup === ALL}
      allLabel="All ads"
      options={(ads.data || []).map((a) => ({
        value: a.adId,
        label: a.finalUrls?.[0] || a.adId,
      }))}
    />
  </div>
);

export default AdsFilters;
