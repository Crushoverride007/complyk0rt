"use client";

import React from 'react';
import UsersTable from '../../components/UsersTable';

export default function UsersPage(){
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <h1 className="text-2xl font-semibold text-card-foreground mb-4">User Management</h1>
      <p className="text-sm text-muted-foreground mb-6">Invite users, manage roles and access.</p>
      <UsersTable />
    </div>
  );
}
