import Icon from "./Icon";
import "./EmptyState.css";

export default function EmptyState({ icon = "info", title, description, action }) {
  return (
    <div className="empty">
      <div className="empty-ico" aria-hidden="true">
        <Icon name={icon} size={26} />
      </div>
      {title && <h3 className="empty-title">{title}</h3>}
      {description && <p className="empty-desc">{description}</p>}
      {action && <div className="empty-action">{action}</div>}
    </div>
  );
}
