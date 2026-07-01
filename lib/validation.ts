// Validação de entrada das server actions de imóvel e empresa.
// RLS no banco continua sendo a última linha de defesa; isso aqui evita que
// payloads malformados/gigantes cheguem até o Supabase.
import { z } from 'zod';

const uuid = z.string().uuid();
const optionalUrl = z.string().trim().url().max(300).optional().or(z.literal(''));
const optionalEmail = z.string().trim().email().max(160).optional().or(z.literal(''));

export const negotiationSchema = z.object({
  negotiation: z.string().min(1),
  price: z.number().nonnegative().nullable(),
  priceVisibility: z.enum(['publico', 'sob_consulta']),
});

export const propertyInputSchema = z
  .object({
    id: uuid.optional(),
    title: z.string().trim().min(5, 'Título muito curto.').max(140, 'Título muito longo.'),
    description: z.string().max(5000).optional(),
    shortDescription: z.string().max(300).optional(),
    typeId: uuid,
    citySlug: z.string().min(1),
    cityId: uuid,
    neighborhoodId: uuid.optional(),
    street: z.string().max(200).optional(),
    number: z.string().max(20).optional(),
    complement: z.string().max(100).optional(),
    zipcode: z.string().max(9).optional(),
    condoName: z.string().max(120).optional(),
    bedrooms: z.number().int().min(0).max(50).optional(),
    suites: z.number().int().min(0).max(50).optional(),
    bathrooms: z.number().int().min(0).max(50).optional(),
    garages: z.number().int().min(0).max(50).optional(),
    builtArea: z.number().nonnegative().nullable().optional(),
    landArea: z.number().nonnegative().nullable().optional(),
    floor: z.number().int().nullable().optional(),
    condoFee: z.number().nonnegative().nullable().optional(),
    iptu: z.number().nonnegative().nullable().optional(),
    videoUrl: optionalUrl,
    tourUrl: optionalUrl,
    contactName: z.string().max(120).optional(),
    contactCompany: z.string().max(120).optional(),
    contactWhatsapp: z.string().max(20).optional(),
    contactPhone: z.string().max(20).optional(),
    contactEmail: optionalEmail,
    leadEmail: optionalEmail,
    brokerId: uuid.nullable().optional(),
    negotiations: z.array(negotiationSchema).min(1, 'Escolha ao menos uma modalidade.'),
    featureIds: z.array(uuid).max(60),
    images: z.array(z.string().trim().url()).max(30, 'No máximo 30 fotos.'),
    publish: z.boolean(),
  })
  .passthrough();

export const companyInputSchema = z
  .object({
    id: uuid.optional(),
    type: z.string().min(1),
    tradeName: z.string().trim().min(2, 'Informe o nome.').max(140),
    legalName: z.string().max(160).optional(),
    cnpj: z.string().max(20).optional(),
    creci: z.string().max(30).optional(),
    description: z.string().max(3000).optional(),
    phone: z.string().max(20).optional(),
    whatsapp: z.string().max(20).optional(),
    email: optionalEmail,
    website: optionalUrl,
    instagram: z.string().max(60).optional(),
    cityId: uuid.optional(),
    logoUrl: z.string().max(500).optional(),
    coverUrl: z.string().max(500).optional(),
    address: z.string().max(300).optional(),
    cityIds: z.array(uuid).max(20),
    specialtyIds: z.array(uuid).max(30),
    businessHours: z.record(z.string(), z.string()),
    brokers: z
      .array(
        z.object({
          name: z.string().trim().min(1).max(120),
          creci: z.string().max(30).optional(),
          phone: z.string().max(20).optional(),
          whatsapp: z.string().max(20).optional(),
          photoUrl: z.string().max(500).optional(),
        }),
      )
      .max(50)
      .optional(),
  })
  .passthrough();

export function firstZodError(error: z.ZodError, fallback: string) {
  return error.issues[0]?.message || fallback;
}
