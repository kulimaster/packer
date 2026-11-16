import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="flex flex-col items-center gap-3 py-24 text-center">
      <p className="font-display text-5xl font-bold text-primary">404</p>
      <h1 className="text-lg font-semibold">Tahle stránka neexistuje</h1>
      <Link to="/" className="text-sm font-semibold text-primary hover:underline">
        Zpět na výlety
      </Link>
    </div>
  );
}
