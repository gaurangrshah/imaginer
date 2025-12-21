import { redirect } from 'next/navigation';

import { auth } from '@clerk/nextjs';

import { Header } from '@/components/shared/header';
import { TransformationForm } from '@/components/shared/transformation-form';

import { transformationTypes } from '@/constants';
import { getImageById } from '@/lib/actions/image.actions';
import { getUserById } from '@/lib/actions/user.actions';

const Page = async ({ params: { id } }: SearchParamProps) => {
  const { userId } = auth();

  if (!userId) redirect("/sign-in");

  const user = await getUserById(userId);
  if (!user) redirect("/sign-in");

  const image = await getImageById(parseInt(id));
  if (!image) redirect("/");

  const transformation =
    transformationTypes[image.transformationType as TransformationTypeKey];

  return (
    <>
      <Header title={transformation.title} subtitle={transformation.subTitle} />

      <section className="mt-10">
        <TransformationForm
          action="Update"
          userId={user.id}
          type={image.transformationType as TransformationTypeKey}
          creditBalance={user.creditBalance || 0}
          config={image.config as Transformations | null}
          data={image}
        />
      </section>
    </>
  );
};

export default Page;
