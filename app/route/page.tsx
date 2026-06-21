import { redirect } from 'next/navigation';

interface RoutePageProps {
  searchParams: { from?: string; to?: string };
}

export default function RoutePageRedirect({ searchParams }: RoutePageProps) {
  const { from, to } = searchParams;
  if (from && to) {
    redirect(`/results?from=${from}&to=${to}`);
  }
  redirect('/');
}
