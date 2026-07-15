import { Input } from "./ui/Field";
import Segmented from "./ui/Segmented";

/**
 * Shared list-page toolbar: search input + optional filter(s) + result count.
 * Extracted from the res-toolbar/res-search/res-count markup that
 * ResourceListPage, UsersPage and AdminsPage each hand-rolled separately.
 *
 * `filters` is an array of { value, onChange, options, ariaLabel } so a page
 * can render one or more Segmented controls, matching ResourceListPage's
 * `config.filters` shape.
 */
export default function ResourceToolbar({
  search,
  onSearchChange,
  searchPlaceholder,
  filters = [],
  count,
  countLabel,
}) {
  return (
    <div className="res-toolbar">
      {onSearchChange && (
        <div className="res-search">
          <Input
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      )}
      {filters.map((f, i) => (
        <div className="res-filters" key={f.key ?? i}>
          <Segmented ariaLabel={f.ariaLabel} value={f.value} onChange={f.onChange} options={f.options} />
        </div>
      ))}
      <div className="res-count">{count} {countLabel}</div>
    </div>
  );
}
