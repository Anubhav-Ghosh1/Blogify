import DashboardEditor from '@/components/DashboardEditor'

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <DashboardEditor id={id} />
}
