interface EmptyCarStateProps {
  hasFilters: boolean;
}

export const EmptyCarState = ({ hasFilters }: EmptyCarStateProps) => {
  return (
    <div className="text-center py-16 text-muted-foreground border-2 border-dashed rounded-xl bg-muted/30">
      <div className="text-4xl mb-3 opacity-50">🚗</div>
      <p className="font-medium">
        {hasFilters
          ? 'Nema vozila koja odgovaraju vašim kriterijima pretrage'
          : 'Nema dostupnih vozila'}
      </p>
    </div>
  );
};
