import { z } from "zod";

export const accountSchema = z
  .object({
    email: z.string().email("Email invalide"),
    password: z.string().min(8, "Minimum 8 caractères"),
    confirmPassword: z.string().min(1, "Veuillez confirmer le mot de passe"),
    fullName: z.string().min(2, "Nom complet requis"),
    phone: z
      .string()
      .regex(/^(6[5-9]\d{7}|2376[5-9]\d{7})$/, "Numéro camerounais invalide (ex: 690123456)"),
    businessType: z.string().min(1, "Type de commerce requis"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

export const shopSchema = z.object({
  shopName: z.string().min(2, "Nom de boutique requis").max(60, "Maximum 60 caractères"),
  city: z.string().min(1, "Ville requise"),
  neighborhood: z.string().min(2, "Quartier requis"),
  description: z
    .string()
    .min(10, "Minimum 10 caractères")
    .max(200, "Maximum 200 caractères"),
  openingHours: z.string().min(1, "Horaires requis"),
  logoUrl: z.string().optional(),
});

export const productSchema = z.object({
  name: z.string().min(2, "Nom du produit requis").max(80, "Maximum 80 caractères"),
  price: z.number().min(100, "Prix minimum 100 FCFA").max(10000000, "Prix maximum 10M FCFA"),
  imageUrl: z.string().optional(),
  category: z.string().min(1, "Catégorie requise"),
  description: z.string().max(300, "Maximum 300 caractères").optional(),
});

export type AccountFormData = z.infer<typeof accountSchema>;
export type ShopFormData = z.infer<typeof shopSchema>;
export type ProductFormData = z.infer<typeof productSchema>;
