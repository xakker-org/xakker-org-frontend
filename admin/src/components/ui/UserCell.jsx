import Avatar from "./Avatar";

/**
 * Shared "person" table cell: avatar + display name + email, two-line.
 * Used by UsersPage/AdminsPage (and ResourceListPage-driven resources that
 * reference a user) so the markup/spacing isn't hand-duplicated per page.
 */
export default function UserCell({ user }) {
  return (
    <div className="res-user-cell">
      <Avatar user={user} size={28} rounded="md" />
      <div className="res-user-cell-text">
        <div className="res-user-cell-name">{user.full_name || user.username}</div>
        <div className="res-user-cell-email">{user.email}</div>
      </div>
    </div>
  );
}
