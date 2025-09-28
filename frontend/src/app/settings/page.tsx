"use client";

import React from "react";
import SettingsCheckboxRow from "../../components/SettingsCheckboxRow";

export default function SettingsPage(){
  const [comments, setComments] = React.useState(true);
  const [candidates, setCandidates] = React.useState(false);
  const [offers, setOffers] = React.useState(false);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-semibold text-card-foreground mb-6">Notifications</h1>
      <div className="rounded-lg border bg-card">
        <div className="px-4 sm:px-6 py-4">
          <p className="text-sm text-muted-foreground">Choose what you want to be notified about.</p>
        </div>
        <div className="px-4 sm:px-6">
          <SettingsCheckboxRow
            id="notify-comments"
            label="Comments"
            description="Get notified when someone posts a comment on a posting."
            checked={comments}
            onChange={setComments}
          />
          <SettingsCheckboxRow
            id="notify-candidates"
            label="Candidates"
            description="Get notified when a candidate applies for a job."
            checked={candidates}
            onChange={setCandidates}
          />
          <SettingsCheckboxRow
            id="notify-offers"
            label="Offers"
            description="Get notified when a candidate accepts or rejects an offer."
            checked={offers}
            onChange={setOffers}
          />
        </div>
      </div>
    </div>
  );
}
