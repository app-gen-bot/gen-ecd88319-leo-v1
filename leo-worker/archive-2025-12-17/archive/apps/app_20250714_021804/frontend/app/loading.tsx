export default function Loading() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary mx-auto"></div>
        <p className="text-muted-foreground">Loading with love...</p>
      </div>
    </div>
  )
}