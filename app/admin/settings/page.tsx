"use client";

import React, { useState } from "react";
import { Settings, Save, CheckCircle2, Shield, Globe, Clock, MapPin, Phone, Mail } from "lucide-react";
import { SITE } from "@/lib/site";

export default function SettingsManager() {
  const [officeName, setOfficeName] = useState(SITE.fullName);
  const [officeLocation, setOfficeLocation] = useState(SITE.address);
  const [chamberNumber, setChamberNumber] = useState(SITE.addressShort);
  const [phone, setPhone] = useState(SITE.phone);
  const [whatsapp, setWhatsapp] = useState(SITE.whatsapp);
  const [timezone] = useState("Asia/Karachi (PKT +05:00)");
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="text-[13px] text-slate-500 font-normal">
        <span>Management</span>
        <span className="mx-2 text-slate-400">/</span>
        <span className="text-slate-700">Settings</span>
      </div>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-[32px] font-bold tracking-tight text-slate-900 leading-tight">
            Settings
          </h1>
          <p className="text-[14.5px] text-slate-500 mt-1">
            Office Chamber parameters, timezone, consultation phone numbers, and CMS configuration.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#075e38] hover:bg-[#064e2e] px-4 py-2 text-[13.5px] font-medium text-white shadow-2xs transition"
        >
          {saved ? (
            <>
              <CheckCircle2 className="h-4 w-4" />
              <span>Saved!</span>
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              <span>Save settings</span>
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Office Information Card */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
              <MapPin className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Office Chamber Identity</h2>
              <p className="text-xs text-slate-500">Official judicial chamber location details</p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Office Title
              </label>
              <input
                type="text"
                value={officeName}
                onChange={(e) => setOfficeName(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Chamber Number & Landmark
              </label>
              <input
                type="text"
                value={chamberNumber}
                onChange={(e) => setChamberNumber(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                District / Court Address
              </label>
              <input
                type="text"
                value={officeLocation}
                onChange={(e) => setOfficeLocation(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Contact & WhatsApp Channels */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
              <Phone className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Client Communication</h2>
              <p className="text-xs text-slate-500">Direct WhatsApp and judicial consultation line</p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Chamber Official Phone
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Direct WhatsApp Helpline
              </label>
              <input
                type="text"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Publishing Timezone
              </label>
              <input
                type="text"
                value={timezone}
                disabled
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600 cursor-not-allowed"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
