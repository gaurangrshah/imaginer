'use server';

/**
 * Image Actions Module
 *
 * Server actions for image management with Cloudinary integration.
 * Uses Drizzle ORM with SQLite database.
 */

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { eq, desc, inArray, sql, and } from 'drizzle-orm';
import { v2 as cloudinary } from 'cloudinary';

import { db, images, users } from '../db';
import { handleError } from '../utils';

/**
 * Add a new image to the database
 */
export async function addImage({ image, userId, path }: AddImageParams) {
  try {
    // Verify user exists
    const [author] = await db.select().from(users).where(eq(users.id, userId));

    if (!author) {
      throw new Error('User not found');
    }

    const [newImage] = await db
      .insert(images)
      .values({
        title: image.title,
        transformationType: image.transformationType,
        publicId: image.publicId,
        secureURL: image.secureURL,
        width: image.width,
        height: image.height,
        config: image.config,
        transformationUrl: image.transformationURL,
        aspectRatio: image.aspectRatio,
        prompt: image.prompt,
        color: image.color,
        authorId: author.id,
      })
      .returning();

    revalidatePath(path);

    return newImage;
  } catch (error) {
    handleError(error);
  }
}

/**
 * Update an existing image
 */
export async function updateImage({ image, userId, path }: UpdateImageParams) {
  try {
    // Verify image exists and belongs to user
    const [imageToUpdate] = await db
      .select()
      .from(images)
      .where(eq(images.id, image.id));

    if (!imageToUpdate || imageToUpdate.authorId !== userId) {
      throw new Error('Unauthorized or image not found');
    }

    const [updatedImage] = await db
      .update(images)
      .set({
        title: image.title,
        transformationType: image.transformationType,
        publicId: image.publicId,
        secureURL: image.secureURL,
        width: image.width,
        height: image.height,
        config: image.config,
        transformationUrl: image.transformationURL,
        aspectRatio: image.aspectRatio,
        prompt: image.prompt,
        color: image.color,
        updatedAt: new Date(),
      })
      .where(eq(images.id, image.id))
      .returning();

    revalidatePath(path);

    return updatedImage;
  } catch (error) {
    handleError(error);
  }
}

/**
 * Delete an image by ID
 */
export async function deleteImage(imageId: number) {
  try {
    await db.delete(images).where(eq(images.id, imageId));
  } catch (error) {
    handleError(error);
  } finally {
    redirect('/');
  }
}

/**
 * Get image by ID with author information
 */
export async function getImageById(imageId: number) {
  try {
    const result = await db
      .select({
        id: images.id,
        title: images.title,
        transformationType: images.transformationType,
        publicId: images.publicId,
        secureURL: images.secureURL,
        width: images.width,
        height: images.height,
        config: images.config,
        transformationUrl: images.transformationUrl,
        aspectRatio: images.aspectRatio,
        color: images.color,
        prompt: images.prompt,
        authorId: images.authorId,
        createdAt: images.createdAt,
        updatedAt: images.updatedAt,
        author: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          clerkId: users.clerkId,
        },
      })
      .from(images)
      .leftJoin(users, eq(images.authorId, users.id))
      .where(eq(images.id, imageId));

    if (!result.length) throw new Error('Image not found');

    return result[0];
  } catch (error) {
    handleError(error);
  }
}

/**
 * Get all images with pagination and optional search
 */
export async function getAllImages({
  limit = 9,
  page = 1,
  searchQuery = '',
}: {
  limit?: number;
  page: number;
  searchQuery?: string;
}) {
  try {
    cloudinary.config({
      cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });

    let expression = 'folder=imaginer';

    if (searchQuery) {
      expression += ` AND ${searchQuery}`;
    }

    const { resources } = await cloudinary.search.expression(expression).execute();

    const resourceIds = resources.map((resource: any) => resource.public_id);

    const offset = (Number(page) - 1) * limit;

    // Build query based on search
    let imageList;
    let totalImages: number;

    if (searchQuery && resourceIds.length > 0) {
      imageList = await db
        .select({
          id: images.id,
          title: images.title,
          transformationType: images.transformationType,
          publicId: images.publicId,
          secureURL: images.secureURL,
          width: images.width,
          height: images.height,
          config: images.config,
          transformationUrl: images.transformationUrl,
          aspectRatio: images.aspectRatio,
          color: images.color,
          prompt: images.prompt,
          authorId: images.authorId,
          createdAt: images.createdAt,
          updatedAt: images.updatedAt,
          author: {
            id: users.id,
            firstName: users.firstName,
            lastName: users.lastName,
            clerkId: users.clerkId,
          },
        })
        .from(images)
        .leftJoin(users, eq(images.authorId, users.id))
        .where(inArray(images.publicId, resourceIds))
        .orderBy(desc(images.updatedAt))
        .limit(limit)
        .offset(offset);

      const [{ count }] = await db
        .select({ count: sql<number>`count(*)` })
        .from(images)
        .where(inArray(images.publicId, resourceIds));
      totalImages = count;
    } else if (searchQuery) {
      // Search query but no Cloudinary results
      return {
        data: [],
        totalPage: 0,
        savedImages: 0,
      };
    } else {
      imageList = await db
        .select({
          id: images.id,
          title: images.title,
          transformationType: images.transformationType,
          publicId: images.publicId,
          secureURL: images.secureURL,
          width: images.width,
          height: images.height,
          config: images.config,
          transformationUrl: images.transformationUrl,
          aspectRatio: images.aspectRatio,
          color: images.color,
          prompt: images.prompt,
          authorId: images.authorId,
          createdAt: images.createdAt,
          updatedAt: images.updatedAt,
          author: {
            id: users.id,
            firstName: users.firstName,
            lastName: users.lastName,
            clerkId: users.clerkId,
          },
        })
        .from(images)
        .leftJoin(users, eq(images.authorId, users.id))
        .orderBy(desc(images.updatedAt))
        .limit(limit)
        .offset(offset);

      const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(images);
      totalImages = count;
    }

    const [{ savedImages }] = await db.select({ savedImages: sql<number>`count(*)` }).from(images);

    return {
      data: imageList,
      totalPage: Math.ceil(totalImages / limit),
      savedImages,
    };
  } catch (error) {
    handleError(error);
  }
}

/**
 * Get images by user ID with pagination
 */
export async function getUserImages({
  limit = 9,
  page = 1,
  userId,
}: {
  limit?: number;
  page: number;
  userId: number;
}) {
  try {
    const offset = (Number(page) - 1) * limit;

    const imageList = await db
      .select({
        id: images.id,
        title: images.title,
        transformationType: images.transformationType,
        publicId: images.publicId,
        secureURL: images.secureURL,
        width: images.width,
        height: images.height,
        config: images.config,
        transformationUrl: images.transformationUrl,
        aspectRatio: images.aspectRatio,
        color: images.color,
        prompt: images.prompt,
        authorId: images.authorId,
        createdAt: images.createdAt,
        updatedAt: images.updatedAt,
        author: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          clerkId: users.clerkId,
        },
      })
      .from(images)
      .leftJoin(users, eq(images.authorId, users.id))
      .where(eq(images.authorId, userId))
      .orderBy(desc(images.updatedAt))
      .limit(limit)
      .offset(offset);

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(images)
      .where(eq(images.authorId, userId));

    return {
      data: imageList,
      totalPages: Math.ceil(count / limit),
    };
  } catch (error) {
    handleError(error);
  }
}
