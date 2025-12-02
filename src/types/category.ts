export type CategoryStatus = "ACTIVE" | "HIDDEN";

export interface Category {
  _id: string;
  name: string;
  title?: string;
  slug: string;
  image?: string;
  description?: string;
  status: CategoryStatus;
  createdAt?: string;
  updatedAt?: string;
}

export type CreateCategoryDTO = {
  name: string;
  slug: string;
  image?: string;
  description?: string;
  status?: CategoryStatus;
};

export const isActive = (c: Pick<Category, "status">) => c.status === "ACTIVE";
