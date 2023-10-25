import Link from 'next/link';
import * as React from 'react';
export default async function HomePage() {
  return (
    <div>
      <Link href={'/admin'}>Admin</Link>
    </div>
  );
}
