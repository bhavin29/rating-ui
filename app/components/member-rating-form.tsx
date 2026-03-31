'use client';

import { Card } from '@/app/components/ui';

export function MemberRatingForm() {
  return (
    <Card className="space-y-3">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Peer rating form unavailable</h2>
        <p className="mt-1 text-sm text-slate-600">
          The current GraphQL API validates the rating link, but it does not yet return the data needed to render the
          full user rating experience.
        </p>
      </div>
      <div className="rounded-lg bg-slate-50 px-3 py-3 text-sm text-slate-600">
        Missing fields from the live API:
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>sprint details for the current token</li>
          <li>the teammate list to be rated</li>
          <li>role-based question sets for each user</li>
        </ul>
      </div>
      <p className="text-sm text-slate-500">
        Once those fields are available from GraphQL, this component can be switched back to the interactive form.
      </p>
    </Card>
  );
}
