import { redirect } from 'next/navigation';

/**
 * Home page component that redirects to the models page
 * Serves as the default landing page for the application
 * @returns Redirect to /models page
 */
export default function Home() {
  redirect('/models');
}
