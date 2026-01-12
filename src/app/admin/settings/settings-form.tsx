"use client";

import { useState, useRef } from "react";
import {
  Save,
  Globe,
  User,
  Mail,
  Shield,
  Bell,
  Upload,
  X,
  Image as ImageIcon,
} from "lucide-react";
import { saveSettings } from "./actions";
import type { Dictionary } from "@/lib/i18n";

interface SettingsFormProps {
  initialSettings: any;
  dict: Dictionary;
}

export default function SettingsForm({
  initialSettings,
  dict,
}: SettingsFormProps) {
  const [settings, setSettings] = useState(initialSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const value =
      e.target.type === "checkbox"
        ? (e.target as HTMLInputElement).checked
        : e.target.value;
    setSettings({ ...settings, [e.target.name]: value });
  };

  const handleToggle = (name: string) => {
    setSettings({
      ...settings,
      [name]: !settings[name as keyof typeof settings],
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const result = await saveSettings(settings);
      if (result.success) {
        alert(dict.common.success);
      } else {
        alert(dict.common.error);
      }
    } catch (error) {
      console.error("Save failed:", error);
      alert(dict.common.error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      alert("File size exceeds 2MB limit");
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("Only image files are allowed");
      return;
    }

    setIsUploadingLogo(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/admin/settings/logo", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setSettings({ ...settings, logoUrl: data.logoUrl });
      } else {
        alert("Failed to upload logo");
      }
    } catch (error) {
      console.error("Logo upload failed:", error);
      alert("Failed to upload logo");
    } finally {
      setIsUploadingLogo(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleLogoDelete = async () => {
    if (!confirm("Are you sure you want to delete the logo?")) return;

    try {
      const response = await fetch("/api/admin/settings/logo", {
        method: "DELETE",
      });

      if (response.ok) {
        setSettings({ ...settings, logoUrl: null });
      } else {
        alert("Failed to delete logo");
      }
    } catch (error) {
      console.error("Logo delete failed:", error);
      alert("Failed to delete logo");
    }
  };

  const tabs = [
    { id: "general", label: dict.settings.general, icon: Globe },
    { id: "author", label: dict.settings.author, icon: User },
    { id: "seo", label: dict.settings.seo, icon: Bell },
    { id: "social", label: dict.settings.social, icon: Mail },
    { id: "security", label: dict.settings.security, icon: Shield },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">{dict.settings.title}</h1>
          <p className="text-xs text-muted-foreground mt-1">
            {dict.settings.subtitle}
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          <Save className="w-4 h-4" />
          {isSaving ? dict.common.saving : dict.common.save}
        </button>
      </div>

      <div className="grid lg:grid-cols-4 gap-4">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition text-sm ${
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {/* General Settings */}
          {activeTab === "general" && (
            <div className="border border-border rounded-lg p-4 space-y-4">
              <h2 className="text-base font-semibold">
                {dict.settings.general}
              </h2>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium mb-1.5">
                    Logo
                  </label>
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 border border-border rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                      {settings.logoUrl ? (
                        <img
                          src={settings.logoUrl}
                          alt="Logo preview"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <ImageIcon className="w-6 h-6 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleLogoUpload}
                        accept="image/*"
                        className="hidden"
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploadingLogo}
                          className="flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                          <Upload className="w-4 h-4" />
                          {isUploadingLogo ? "Uploading..." : "Upload"}
                        </button>
                        {settings.logoUrl && (
                          <button
                            type="button"
                            onClick={handleLogoDelete}
                            className="flex items-center gap-2 px-3 py-2 border border-border rounded-lg hover:bg-accent transition text-sm"
                          >
                            <X className="w-4 h-4" />
                            Delete
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        PNG, JPG, SVG up to 2MB
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="siteName"
                    className="block text-xs font-medium mb-1.5"
                  >
                    {dict.settings.fields.siteName}{" "}
                    <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    id="siteName"
                    name="siteName"
                    value={settings.siteName || ""}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="siteDescription"
                    className="block text-xs font-medium mb-1.5"
                  >
                    {dict.settings.fields.siteDescription}
                  </label>
                  <textarea
                    id="siteDescription"
                    name="siteDescription"
                    value={settings.siteDescription || ""}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  />
                </div>

                <div>
                  <label
                    htmlFor="siteUrl"
                    className="block text-xs font-medium mb-1.5"
                  >
                    {dict.settings.fields.siteUrl}{" "}
                    <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="url"
                    id="siteUrl"
                    name="siteUrl"
                    value={settings.siteUrl || ""}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="language"
                    className="block text-xs font-medium mb-1.5"
                  >
                    {dict.settings.fields.language}
                  </label>
                  <select
                    id="language"
                    name="language"
                    value={settings.language || "zh-CN"}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  >
                    <option value="zh-CN">简体中文</option>
                    <option value="en-US">English</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Author Info */}
          {activeTab === "author" && (
            <div className="border border-border rounded-lg p-4 space-y-4">
              <h2 className="text-base font-semibold">
                {dict.settings.author}
              </h2>

              <div className="space-y-3">
                <div>
                  <label
                    htmlFor="authorName"
                    className="block text-xs font-medium mb-1.5"
                  >
                    {dict.settings.fields.authorName}{" "}
                    <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    id="authorName"
                    name="authorName"
                    value={settings.authorName || ""}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="authorEmail"
                    className="block text-xs font-medium mb-1.5"
                  >
                    {dict.settings.fields.authorEmail}{" "}
                    <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="email"
                    id="authorEmail"
                    name="authorEmail"
                    value={settings.authorEmail || ""}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="authorBio"
                    className="block text-xs font-medium mb-1.5"
                  >
                    {dict.settings.fields.authorBio}
                  </label>
                  <textarea
                    id="authorBio"
                    name="authorBio"
                    value={settings.authorBio || ""}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SEO */}
          {activeTab === "seo" && (
            <div className="border border-border rounded-lg p-4 space-y-4">
              <h2 className="text-base font-semibold">{dict.settings.seo}</h2>

              <div className="space-y-3">
                <div>
                  <label
                    htmlFor="metaTitle"
                    className="block text-xs font-medium mb-1.5"
                  >
                    {dict.settings.fields.metaTitle}
                  </label>
                  <input
                    type="text"
                    id="metaTitle"
                    name="metaTitle"
                    value={settings.metaTitle || ""}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    {dict.settings.hints.metaTitle}
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="metaDescription"
                    className="block text-xs font-medium mb-1.5"
                  >
                    {dict.settings.fields.metaDescription}
                  </label>
                  <textarea
                    id="metaDescription"
                    name="metaDescription"
                    value={settings.metaDescription || ""}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    {dict.settings.hints.metaDescription}
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="metaKeywords"
                    className="block text-xs font-medium mb-1.5"
                  >
                    {dict.settings.fields.metaKeywords}
                  </label>
                  <input
                    type="text"
                    id="metaKeywords"
                    name="metaKeywords"
                    value={settings.metaKeywords || ""}
                    onChange={handleChange}
                    placeholder={dict.settings.placeholders.keywords}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Social */}
          {activeTab === "social" && (
            <div className="border border-border rounded-lg p-4 space-y-4">
              <h2 className="text-base font-semibold">
                {dict.settings.social}
              </h2>

              <div className="space-y-3">
                <div>
                  <label
                    htmlFor="twitterHandle"
                    className="block text-xs font-medium mb-1.5"
                  >
                    {dict.settings.fields.twitterHandle}
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 bg-muted border border-r-0 border-border rounded-l-lg text-muted-foreground text-sm">
                      @
                    </span>
                    <input
                      type="text"
                      id="twitterHandle"
                      name="twitterHandle"
                      value={settings.twitterHandle || ""}
                      onChange={handleChange}
                      className="flex-1 px-3 py-2 border border-border rounded-r-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="githubHandle"
                    className="block text-xs font-medium mb-1.5"
                  >
                    {dict.settings.fields.githubHandle}
                  </label>
                  <input
                    type="text"
                    id="githubHandle"
                    name="githubHandle"
                    value={settings.githubHandle || ""}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Security / Notifications */}
          {activeTab === "security" && (
            <div className="border border-border rounded-lg p-4 space-y-4">
              <h2 className="text-base font-semibold">
                {dict.settings.security}
              </h2>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-sm">
                      {dict.settings.fields.emailNotifications}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {dict.settings.hints.emailNotifications}
                    </p>
                  </div>
                  <button
                    onClick={() => handleToggle("emailNotifications")}
                    className={`relative w-10 h-5 rounded-full transition-colors ${
                      settings.emailNotifications ? "bg-primary" : "bg-muted"
                    }`}
                  >
                    <span
                      className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-transform ${
                        settings.emailNotifications ? "left-6" : "left-1"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-sm">
                      {dict.settings.fields.commentNotifications}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {dict.settings.hints.commentNotifications}
                    </p>
                  </div>
                  <button
                    onClick={() => handleToggle("commentNotifications")}
                    className={`relative w-10 h-5 rounded-full transition-colors ${
                      settings.commentNotifications ? "bg-primary" : "bg-muted"
                    }`}
                  >
                    <span
                      className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-transform ${
                        settings.commentNotifications ? "left-6" : "left-1"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
