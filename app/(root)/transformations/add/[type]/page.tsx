import { auth } from '@clerk/nextjs';

import { Header } from '@/components/shared/header';
import { TransformationForm } from '@/components/shared/transformation-form';

import { transformationTypes } from '@/constants';
import { getUserById } from '@/lib/actions/user.actions';

export default async function AddTransformationTypePage({ params: { type } }: SearchParamProps) {
  const transformation = transformationTypes[type];
  const { userId } = auth()

  if (!userId) alert('You are not logged in')

  // if (!userId) return redirect('/sign-in')
  const user = await getUserById(userId!)
  return (
    <>
      <Header title={transformation.title} subtitle={transformation.subTitle} />
      <section className="mt-10">
        <TransformationForm
          action="Add"
          type={transformation.type as TransformationTypeKey}
          userId={user._id}
          creditBalance={user?.creditBalance}
        />
      </section>
    </>
  );
}
