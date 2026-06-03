import AdminEditor from '@/components/AdminEditor'

type Props = { params: Promise<{ id: string }> }

export default async function EditPostPage({ params }: Props) {
  const { id } = await params
  return <AdminEditor id={id} />
}
