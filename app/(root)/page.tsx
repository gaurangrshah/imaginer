import { UserButton } from '@clerk/nextjs';

export default function HomePage() {
  return (
    <div>
      <p>Home</p>
      <UserButton afterSignOutUrl="/" />
    </div>
  );
}
