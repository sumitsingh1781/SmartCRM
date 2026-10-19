
"use client";

import { useEffect, useState } from "react";

type Preferences = {
  fullName: string;
  email: string;
  role: string;
  company: string;
  theme: string;
  compactMode: boolean;
  emailNotifications: boolean;
  taskReminders: boolean;
  weeklyReports: boolean;
};

const defaultPreferences: Preferences = {
  fullName: "Sumit Singh",
  email: "",
  role: "Admin",
  company: "SmartCRM",
  theme: "dark",
  compactMode: false,
  emailNotifications: true,
  taskReminders: true,
  weeklyReports: false,
};

export default function SettingsPage() {
  const [settings, setSettings] =
    useState<Preferences>(defaultPreferences);
  const [activeSection, setActiveSection] = useState("profile");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const preferences = JSON.parse(
        localStorage.getItem("smartcrm-settings") || "{}"
      );

      setSettings((previous) => ({
        ...previous,
        ...preferences,
        fullName: preferences.fullName || user.name || previous.fullName,
        email: preferences.email || user.email || "",
        role: preferences.role || user.role || previous.role,
      }));
    } catch (error) {
      console.error("Unable to load settings:", error);
    }
  }, []);

  function updateSetting<K extends keyof Preferences>(
    key: K,
    value: Preferences[K]
  ) {
    setSettings((previous) => ({ ...previous, [key]: value }));
    setSaved(false);
  }

  function saveSettings() {
    try {
      localStorage.setItem("smartcrm-settings", JSON.stringify(settings));
      setSaved(true);
    } catch (error) {
      console.error("Unable to save settings:", error);
      setSaved(false);
      alert("Settings save nahi ho paayi. Browser storage check karo.");
    }
  }

  const sections = [
    { id: "profile", icon: "♙", label: "Profile", description: "Personal information" },
    { id: "appearance", icon: "◐", label: "Appearance", description: "Customize your workspace" },
    { id: "notifications", icon: "♧", label: "Notifications", description: "Manage your alerts" },
    { id: "preferences", icon: "⚙", label: "Preferences", description: "General application settings" },
  ];

  return (
    <main className="settings-page">
      <style jsx>{`
        .settings-page {
          min-height: 100vh;
          padding: 32px;
          color: #edf1ff;
          background: #0b1020;
          font-family: Arial, Helvetica, sans-serif;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          flex-wrap: wrap;
          gap: 20px;
          margin-bottom: 28px;
        }

        .eyebrow {
          color: #9c8cff;
          font-size: 12px;
          letter-spacing: 2px;
          font-weight: 700;
          text-transform: uppercase;
          margin-bottom: 10px;
        }

        h1 {
          font-size: clamp(27px, 3vw, 34px);
          letter-spacing: -1px;
          margin: 0 0 9px;
        }

        .subtitle {
          color: #929db7;
          font-size: 14px;
          line-height: 1.6;
          margin: 0;
        }

        button, input, select {
          font: inherit;
        }

        button {
          cursor: pointer;
        }

        .save-button {
          border: 0;
          border-radius: 10px;
          padding: 12px 18px;
          color: white;
          background: linear-gradient(135deg, #7164f7, #5947d9);
          font-size: 13px;
          font-weight: 700;
        }

        .save-button:hover {
          filter: brightness(1.1);
        }

        .settings-layout {
          display: grid;
          grid-template-columns: 245px minmax(0, 1fr);
          gap: 22px;
          align-items: start;
        }

        .panel {
          border: 1px solid #202b43;
          border-radius: 16px;
          background: linear-gradient(145deg, #141d32, #101729);
          padding: 22px;
          min-width: 0;
        }

        .section-menu {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .section-button {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 12px;
          text-align: left;
          padding: 13px 12px;
          border: 1px solid transparent;
          border-radius: 11px;
          color: #a8b4cc;
          background: transparent;
        }

        .section-button:hover {
          background: #1b2540;
        }

        .section-button.active {
          color: #eeeaff;
          background: #27244c;
          border-color: #3c376c;
        }

        .menu-icon {
          width: 35px;
          height: 35px;
          flex-shrink: 0;
          display: grid;
          place-items: center;
          border-radius: 10px;
          background: #202943;
          font-size: 17px;
        }

        .active .menu-icon {
          background: #3a326b;
          color: #c6bbff;
        }

        .menu-label {
          display: block;
          font-size: 13px;
          font-weight: 700;
          margin-bottom: 4px;
        }

        .menu-description {
          display: block;
          font-size: 10px;
          color: #8491ad;
        }

        .section-heading {
          padding-bottom: 20px;
          border-bottom: 1px solid #29334a;
          margin-bottom: 22px;
        }

        h2 {
          font-size: 17px;
          margin: 0 0 7px;
        }

        .section-heading p {
          color: #8491ad;
          font-size: 12px;
          margin: 0;
          line-height: 1.6;
        }

        .avatar-row {
          display: flex;
          align-items: center;
          gap: 15px;
          padding-bottom: 24px;
          margin-bottom: 24px;
          border-bottom: 1px solid #29334a;
        }

        .avatar {
          width: 66px;
          height: 66px;
          flex-shrink: 0;
          display: grid;
          place-items: center;
          border-radius: 18px;
          color: white;
          font-size: 23px;
          font-weight: 750;
          background: linear-gradient(135deg, #796aff, #4b3bc4);
          box-shadow: 0 8px 24px #5644cc30;
        }

        .avatar-name {
          font-weight: 700;
          font-size: 14px;
          margin-bottom: 6px;
        }

        .muted {
          color: #8491ad;
          font-size: 12px;
          line-height: 1.6;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 21px;
        }

        .field {
          display: flex;
          flex-direction: column;
          gap: 9px;
          min-width: 0;
        }

        .field label {
          color: #c6cfe2;
          font-size: 12px;
          font-weight: 600;
        }

        .field input, .field select {
          width: 100%;
          min-width: 0;
          box-sizing: border-box;
          padding: 12px 13px;
          border: 1px solid #2a3650;
          border-radius: 9px;
          background: #0d1528;
          color: #edf1ff;
          font-size: 13px;
          outline: none;
        }

        .field input:focus, .field select:focus {
          border-color: #8173ff;
          box-shadow: 0 0 0 3px #8173ff18;
        }

        .field input:disabled {
          color: #7f8ba5;
          cursor: not-allowed;
        }

        .field-hint {
          color: #7885a0;
          font-size: 11px;
          line-height: 1.5;
        }

        .setting-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          padding: 18px 0;
          border-bottom: 1px solid #252f46;
        }

        .setting-row:first-of-type {
          padding-top: 0;
        }

        .setting-row:last-child {
          border-bottom: 0;
          padding-bottom: 0;
        }

        .setting-title {
          color: #e3e9f8;
          font-size: 13px;
          font-weight: 650;
          margin-bottom: 6px;
        }

        .setting-description {
          color: #8491ad;
          font-size: 12px;
          line-height: 1.6;
          max-width: 420px;
        }

        .switch {
          width: 44px;
          height: 25px;
          position: relative;
          flex-shrink: 0;
          border: 0;
          border-radius: 20px;
          background: #34405a;
          transition: background 0.2s;
        }

        .switch.on {
          background: #7164f7;
        }

        .switch::after {
          content: "";
          position: absolute;
          width: 17px;
          height: 17px;
          left: 4px;
          top: 4px;
          border-radius: 50%;
          background: white;
          transition: transform 0.2s;
        }

        .switch.on::after {
          transform: translateX(19px);
        }

        .theme-options {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
          margin-top: 10px;
        }

        .theme-option {
          text-align: left;
          border: 2px solid #2b3650;
          border-radius: 12px;
          background: #0e1629;
          padding: 12px;
          color: #e9edfb;
        }

        .theme-option.selected {
          border-color: #8072ff;
          box-shadow: 0 0 0 2px #8072ff19;
        }

        .theme-preview {
          height: 80px;
          border-radius: 8px;
          margin-bottom: 12px;
          padding: 10px;
          display: flex;
          gap: 8px;
        }

        .dark-preview {
          background: #0b1020;
        }

        .light-preview {
          background: #edf0f8;
        }

        .preview-sidebar {
          width: 25%;
          border-radius: 4px;
          background: #242c45;
        }

        .preview-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .preview-line {
          height: 9px;
          border-radius: 4px;
          background: #4d5b7b;
        }

        .light-preview .preview-sidebar {
          background: #d1d8ea;
        }

        .light-preview .preview-line {
          background: #b9c5df;
        }

        .theme-name {
          font-size: 12px;
          font-weight: 700;
          margin-bottom: 5px;
        }

        .theme-hint {
          font-size: 10px;
          color: #8d99b4;
        }

        .success-message {
          margin-top: 18px;
          border: 1px solid #245a49;
          background: #12352d;
          color: #86e8c0;
          padding: 12px 14px;
          border-radius: 9px;
          font-size: 12px;
        }

        .bottom-note {
          color: #7785a2;
          font-size: 11px;
          line-height: 1.7;
          margin-top: 18px;
        }

        @media (max-width: 900px) {
          .settings-layout {
            grid-template-columns: 1fr;
          }

          .section-menu {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 600px) {
          .settings-page {
            padding: 22px 14px;
          }

          .panel {
            padding: 17px;
          }

          .form-grid {
            grid-template-columns: 1fr;
          }

          .section-menu {
            grid-template-columns: 1fr;
          }

          .setting-row {
            gap: 12px;
          }

          .theme-options {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <header className="page-header">
        <div>
          <div className="eyebrow">Workspace Configuration</div>
          <h1>Settings</h1>
          <p className="subtitle">
            Manage your profile and customize your SmartCRM experience.
          </p>
        </div>

        <button className="save-button" onClick={saveSettings}>
          Save Changes
        </button>
      </header>

      <div className="settings-layout">
        <aside className="panel">
          <div className="section-menu">
            {sections.map((section) => (
              <button
                type="button"
                key={section.id}
                className={
                  "section-button " +
                  (activeSection === section.id ? "active" : "")
                }
                onClick={() => {
                  setActiveSection(section.id);
                  setSaved(false);
                }}
              >
                <span className="menu-icon">{section.icon}</span>
                <span>
                  <span className="menu-label">{section.label}</span>
                  <span className="menu-description">
                    {section.description}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </aside>

        <section className="panel">
          {activeSection === "profile" && (
            <>
              <div className="section-heading">
                <h2>Profile Information</h2>
                <p>
                  Update the personal information shown in your workspace.
                </p>
              </div>

              <div className="avatar-row">
                <div className="avatar">
                  {settings.fullName
                    .split(" ")
                    .filter(Boolean)
                    .map((part) => part[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase() || "U"}
                </div>
                <div>
                  <div className="avatar-name">
                    {settings.fullName || "Your Name"}
                  </div>
                  <div className="muted">
                    {settings.role} · SmartCRM Workspace
                  </div>
                </div>
              </div>

              <div className="form-grid">
                <div className="field">
                  <label htmlFor="fullName">Full Name</label>
                  <input
                    id="fullName"
                    value={settings.fullName}
                    onChange={(event) =>
                      updateSetting("fullName", event.target.value)
                    }
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="field">
                  <label htmlFor="email">Email Address</label>
                  <input
                    id="email"
                    type="email"
                    value={settings.email}
                    onChange={(event) =>
                      updateSetting("email", event.target.value)
                    }
                    placeholder="you@example.com"
                  />
                </div>

                <div className="field">
                  <label htmlFor="role">Role</label>
                  <input
                    id="role"
                    value={settings.role}
                    disabled
                  />
                  <span className="field-hint">
                    Role changes are not available here.
                  </span>
                </div>

                <div className="field">
                  <label htmlFor="company">Workspace Name</label>
                  <input
                    id="company"
                    value={settings.company}
                    onChange={(event) =>
                      updateSetting("company", event.target.value)
                    }
                    placeholder="Workspace name"
                  />
                </div>
              </div>
            </>
          )}

          {activeSection === "appearance" && (
            <>
              <div className="section-heading">
                <h2>Appearance</h2>
                <p>
                  Choose your preferred theme and workspace density.
                </p>
              </div>

              <div className="field">
                <label>Workspace Theme</label>

                <div className="theme-options">
                  <button
                    type="button"
                    className={
                      "theme-option " +
                      (settings.theme === "dark" ? "selected" : "")
                    }
                    onClick={() => updateSetting("theme", "dark")}
                  >
                    <div className="theme-preview dark-preview">
                      <div className="preview-sidebar" />
                      <div className="preview-content">
                        <div className="preview-line" />
                        <div className="preview-line" />
                        <div className="preview-line" />
                      </div>
                    </div>
                    <div className="theme-name">Dark</div>
                    <div className="theme-hint">
                      Dark background with purple accents
                    </div>
                  </button>

                  <button
                    type="button"
                    className={
                      "theme-option " +
                      (settings.theme === "light" ? "selected" : "")
                    }
                    onClick={() => updateSetting("theme", "light")}
                  >
                    <div className="theme-preview light-preview">
                      <div className="preview-sidebar" />
                      <div className="preview-content">
                        <div className="preview-line" />
                        <div className="preview-line" />
                        <div className="preview-line" />
                      </div>
                    </div>
                    <div className="theme-name">Light</div>
                    <div className="theme-hint">
                      Light background with subtle contrast
                    </div>
                  </button>
                </div>

                <span className="field-hint">
                  Theme selection is saved as a preference. Applying it
                  throughout the application requires theme support in the
                  shared layout and styles.
                </span>
              </div>

              <div style={{ marginTop: 25 }}>
                <div className="setting-row">
                  <div>
                    <div className="setting-title">Compact Layout</div>
                    <div className="setting-description">
                      Save a preference for tighter spacing across CRM pages.
                    </div>
                  </div>

                  <button
                    type="button"
                    role="switch"
                    aria-checked={settings.compactMode}
                    aria-label="Compact layout"
                    className={
                      "switch " + (settings.compactMode ? "on" : "")
                    }
                    onClick={() =>
                      updateSetting("compactMode", !settings.compactMode)
                    }
                  />
                </div>
              </div>
            </>
          )}

          {activeSection === "notifications" && (
            <>
              <div className="section-heading">
                <h2>Notification Settings</h2>
                <p>
                  Choose which notification preferences you want to keep
                  enabled.
                </p>
              </div>

              <div className="setting-row">
                <div>
                  <div className="setting-title">Email Notifications</div>
                  <div className="setting-description">
                    Preference for receiving CRM updates through email.
                  </div>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={settings.emailNotifications}
                  aria-label="Email notifications"
                  className={
                    "switch " +
                    (settings.emailNotifications ? "on" : "")
                  }
                  onClick={() =>
                    updateSetting(
                      "emailNotifications",
                      !settings.emailNotifications
                    )
                  }
                />
              </div>

              <div className="setting-row">
                <div>
                  <div className="setting-title">Task Reminders</div>
                  <div className="setting-description">
                    Preference for reminders about upcoming and pending tasks.
                  </div>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={settings.taskReminders}
                  aria-label="Task reminders"
                  className={
                    "switch " + (settings.taskReminders ? "on" : "")
                  }
                  onClick={() =>
                    updateSetting("taskReminders", !settings.taskReminders)
                  }
                />
              </div>

              <div className="setting-row">
                <div>
                  <div className="setting-title">Weekly Reports</div>
                  <div className="setting-description">
                    Preference for receiving a weekly business summary.
                  </div>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={settings.weeklyReports}
                  aria-label="Weekly reports"
                  className={
                    "switch " + (settings.weeklyReports ? "on" : "")
                  }
                  onClick={() =>
                    updateSetting("weeklyReports", !settings.weeklyReports)
                  }
                />
              </div>

              <p className="bottom-note">
                These switches currently save your preferences in this
                browser. Actual email delivery and reminders require
                notification functionality in the backend.
              </p>
            </>
          )}

          {activeSection === "preferences" && (
            <>
              <div className="section-heading">
                <h2>General Preferences</h2>
                <p>
                  Configure your preferred workspace options.
                </p>
              </div>

              <div className="field">
                <label htmlFor="language">Language</label>
                <select id="language" value="en" disabled>
                  <option value="en">English</option>
                </select>
                <span className="field-hint">
                  English is currently the default interface language.
                </span>
              </div>

              <div style={{ marginTop: 24 }}>
                <div className="setting-row">
                  <div>
                    <div className="setting-title">Compact Layout</div>
                    <div className="setting-description">
                      Store your preference for a more compact interface.
                    </div>
                  </div>

                  <button
                    type="button"
                    role="switch"
                    aria-checked={settings.compactMode}
                    aria-label="Compact layout preference"
                    className={
                      "switch " + (settings.compactMode ? "on" : "")
                    }
                    onClick={() =>
                      updateSetting("compactMode", !settings.compactMode)
                    }
                  />
                </div>
              </div>

              <p className="bottom-note">
                Preferences are stored in this browser and are not synced
                across devices.
              </p>
            </>
          )}

          {saved && (
            <div className="success-message">
              ✓ Settings saved successfully in this browser.
            </div>
          )}
        </section>
      </div>

      <p className="bottom-note">
        SmartCRM Settings · Profile and preferences are stored locally.
        Changes here do not update your account in the database.
      </p>
    </main>
  );
}
