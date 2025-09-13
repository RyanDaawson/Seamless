import './UserProfile.css';

function UserProfile({ profile }) {
  if (!profile) {
    return null;
  }

  return (
    <div className="user-profile">
      <h3>Welcome to Seamless!</h3>
      <div className="profile-content">
        {profile.images && profile.images[0] && (
          <img 
            src={profile.images[0].url} 
            alt="Profile" 
            className="profile-image"
          />
        )}
        <div className="profile-info">
          {profile.display_name && (
            <p className="display-name">{profile.display_name}</p>
          )}
          {profile.email && (
            <p className="email">{profile.email}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserProfile;
