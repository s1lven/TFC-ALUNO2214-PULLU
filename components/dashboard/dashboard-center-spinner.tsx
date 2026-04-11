export function DashboardCenterSpinner({ label = 'Loading...' }: { label?: string }) {
  return (
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-gray-400 mx-auto mb-4" />
      <p className="text-gray-600">{label}</p>
    </div>
  )
}
