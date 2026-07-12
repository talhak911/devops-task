import React, { useState, useEffect } from "react";
import {
  Box, Typography, TextField, Button, Stack, IconButton, Grid,
  Select, MenuItem, FormControl, InputLabel, Alert,
  Switch, FormControlLabel
} from "@mui/material";
import { Add, Delete, CloudUpload, Close } from "@mui/icons-material";
import { useForm, useFieldArray, Controller, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { compressImage } from "../../../utils/imageCompression";

const variantSchema = z.object({
  sku: z.string().min(1, "SKU is required"),
  label: z.string().min(1, "Label is required"),
  weightGrams: z.number().min(0),
  priceDelta: z.number(),
  stockQuantity: z.number().min(0),
  isActive: z.boolean(),
});

const productSchema = z.object({
  title: z.string().min(2, "Title is too short"),
  slug: z.string().min(2, "Slug is required"),
  description: z.string(),
  categoryId: z.string().min(1, "Category is required"),
  basePrice: z.number().min(0, "Price cannot be negative"),
  origin: z.string(),
  isOrganic: z.boolean(),
  isVegan: z.boolean(),
  flavor: z.string(),
  qualities: z.string(),
  caffeine: z.string(),
  allergens: z.string(),
  ingredients: z.string(),
  tags: z.string(),
  isActive: z.boolean(),
  variants: z.array(variantSchema).min(1, "At least one variant is required"),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
  initialData?: any;
  categories: { _id: string; name: string }[];
  onSubmit: (data: FormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const ProductForm: React.FC<ProductFormProps> = ({
  initialData,
  categories,
  onSubmit,
  onCancel,
  isLoading
}) => {
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>(initialData?.images || []);
  const [existingImages, setExistingImages] = useState<string[]>(initialData?.images || []);
  const [globalError, setGlobalError] = useState("");

  const { control, register, handleSubmit, watch, setValue, formState: { errors } } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      title: "", slug: "", description: "", categoryId: "", basePrice: 0,
      origin: "", isOrganic: false, isVegan: false, flavor: "", qualities: "",
      caffeine: "", allergens: "", ingredients: "", tags: "",
      isActive: true,
      variants: [{ sku: "", label: "", weightGrams: 0, priceDelta: 0, stockQuantity: 0, isActive: true }],
      ...(initialData ? {
        ...initialData,
        basePrice: Number(initialData.basePrice || 0),
        categoryId: typeof initialData.categoryId === 'object' ? initialData.categoryId?._id : (initialData.categoryId || ""),
        variants: initialData.variants?.map((v: any) => ({
          ...v,
          weightGrams: Number(v.weightGrams || 0),
          priceDelta: Number(v.priceDelta || 0),
          stockQuantity: Number(v.stockQuantity || 0),
          isActive: v.isActive ?? true
        })) || [],
        tags: Array.isArray(initialData.tags) ? initialData.tags.join(", ") : initialData.tags || "",
        ingredients: Array.isArray(initialData.ingredients) ? initialData.ingredients.join(", ") : initialData.ingredients || "",
        allergens: Array.isArray(initialData.allergens) ? initialData.allergens.join(", ") : initialData.allergens || "",
      } : {})
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "variants"
  });

  // Auto-slug generation
  const title = watch("title");
  useEffect(() => {
    if (!initialData && title) {
      const slug = title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
      setValue("slug", slug);
    }
  }, [title, setValue, initialData]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const processedFiles: File[] = [];
      const newUrls: string[] = [];

      for (const file of files) {
        try {
          const compressed = file.size > 200 * 1024
            ? await compressImage(file, 1500, 1500, 0.75)
            : file;
          processedFiles.push(compressed);
          newUrls.push(URL.createObjectURL(compressed));
        } catch (err) {
          console.error("Compression failed", err);
          processedFiles.push(file);
          newUrls.push(URL.createObjectURL(file));
        }
      }

      setNewFiles(prev => [...prev, ...processedFiles]);
      setPreviews(prev => [...prev, ...newUrls]);
    }
  };

  const removeImage = (index: number) => {
    const isExisting = index < existingImages.length;
    if (isExisting) {
      setExistingImages(prev => prev.filter((_, i) => i !== index));
    } else {
      const newIdx = index - existingImages.length;
      setNewFiles(prev => prev.filter((_, i) => i !== newIdx));
    }
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const onFormSubmit: SubmitHandler<ProductFormData> = async (data) => {
    setGlobalError("");
    const formData = new FormData();

    // Append standard fields
    Object.entries(data).forEach(([key, value]) => {
      if (key !== 'variants' && key !== 'tags' && key !== 'ingredients' && key !== 'allergens') {
        formData.append(key, String(value));
      }
    });

    // Handle stringified fields
    formData.set("tags", JSON.stringify(data.tags?.split(",").map(t => t.trim()).filter(Boolean) || []));
    formData.set("ingredients", JSON.stringify(data.ingredients?.split(",").map(t => t.trim()).filter(Boolean) || []));
    formData.set("allergens", JSON.stringify(data.allergens?.split(",").map(t => t.trim()).filter(Boolean) || []));
    formData.set("variants", JSON.stringify(data.variants));

    // Handle images
    newFiles.forEach(file => formData.append("images", file));
    existingImages.forEach(img => formData.append("images", img));

    try {
      await onSubmit(formData);
    } catch (err: any) {
      setGlobalError(err.response?.data?.message || "Failed to save product");
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onFormSubmit)}>
      {globalError && <Alert severity="error" sx={{ mb: 3 }}>{globalError}</Alert>}

      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Stack spacing={3}>
            {/* Basic Info */}
            <Box sx={{ border: "1px solid var(--color-outline)", p: 3 }}>
              <Typography sx={{ fontFamily: "Montserrat", fontWeight: 600, mb: 2 }}>Basic Information</Typography>
              <Stack spacing={2}>
                <TextField
                  label="Title" fullWidth size="small"
                  {...register("title")}
                  error={!!errors.title} helperText={errors.title?.message}
                />
                <TextField
                  label="Slug" fullWidth size="small"
                  {...register("slug")}
                  error={!!errors.slug} helperText={errors.slug?.message}
                />
                <TextField
                  label="Description" fullWidth multiline rows={3} size="small"
                  {...register("description")}
                />
                <Grid container spacing={2}>
                  <Grid size={{ xs: 6 }}>
                    <Controller
                      name="categoryId"
                      control={control}
                      render={({ field }) => (
                        <FormControl fullWidth size="small" error={!!errors.categoryId}>
                          <InputLabel>Category</InputLabel>
                          <Select {...field} label="Category">
                            {categories.map(c => <MenuItem key={c._id} value={c._id}>{c.name}</MenuItem>)}
                          </Select>
                          {errors.categoryId && <Typography variant="caption" color="error">{errors.categoryId.message}</Typography>}
                        </FormControl>
                      )}
                    />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <TextField
                      label="Base Price (€)" type="float" fullWidth size="small"
                      {...register("basePrice", { valueAsNumber: true })}
                      error={!!errors.basePrice} helperText={errors.basePrice?.message}
                    />
                  </Grid>
                </Grid>

                <Box>
                  <Typography sx={{ fontSize: '12px', color: 'text.secondary', mb: 1 }}>Gallery ({previews.length}/5)</Typography>
                  <Grid container spacing={1}>
                    {previews.map((src, i) => (
                      <Grid key={i} size={{ xs: 4, sm: 3, md: 2 }}>
                        <Box sx={{ position: 'relative', width: '100%', aspectRatio: '1/1', border: '1px solid var(--color-outline)' }}>
                          <Box component="img" src={src} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <IconButton
                            size="small" onClick={() => removeImage(i)}
                            sx={{ position: 'absolute', top: -8, right: -8, bgcolor: 'error.main', color: 'white', '&:hover': { bgcolor: 'error.dark' }, p: 0.2 }}
                          >
                            <Close fontSize="small" />
                          </IconButton>
                        </Box>
                      </Grid>
                    ))}
                    {previews.length < 5 && (
                      <Grid size={{ xs: 4, sm: 3, md: 2 }}>
                        <Button
                          component="label" fullWidth variant="outlined"
                          sx={{ aspectRatio: '1/1', borderStyle: 'dashed', flexDirection: 'column', gap: 1, p: 0 }}
                        >
                          <CloudUpload />
                          <Typography sx={{ fontSize: '10px' }}>UPLOAD</Typography>
                          <input type="file" hidden multiple accept="image/*" onChange={handleFileChange} />
                        </Button>
                      </Grid>
                    )}
                  </Grid>
                </Box>
              </Stack>
            </Box>

            {/* Tea Details */}
            <Box sx={{ border: "1px solid var(--color-outline)", p: 3 }}>
              <Typography sx={{ fontFamily: "Montserrat", fontWeight: 600, mb: 2 }}>Specifications</Typography>
              <Grid container spacing={2}>
                {[
                  { label: "Origin", name: "origin" },
                  { label: "Flavor", name: "flavor" },
                  { label: "Qualities", name: "qualities" },
                  { label: "Caffeine", name: "caffeine" },
                ].map((f) => (
                  <Grid key={f.name} size={{ xs: 12, sm: 6 }}>
                    <TextField label={f.label} fullWidth size="small" {...register(f.name as any)} />
                  </Grid>
                ))}
                <Grid size={{ xs: 12 }}>
                  <TextField label="Ingredients (comma-separated)" fullWidth size="small" {...register("ingredients")} />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField label="Allergens (comma-separated)" fullWidth size="small" {...register("allergens")} />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField label="Tags (comma-separated)" placeholder="detox, organic, green-tea" fullWidth size="small" {...register("tags")} />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Controller
                    name="isOrganic"
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={<Switch checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />}
                        label={<Typography sx={{ fontFamily: "Montserrat", fontSize: "14px" }}>Organic</Typography>}
                      />
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Controller
                    name="isVegan"
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={<Switch checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />}
                        label={<Typography sx={{ fontFamily: "Montserrat", fontSize: "14px" }}>Vegan</Typography>}
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </Box>

            {/* Variants */}
            <Box sx={{ border: "1px solid var(--color-outline)", p: 3 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Typography sx={{ fontFamily: "Montserrat", fontWeight: 600 }}>Packaging Variants</Typography>
                <Button
                  size="small" startIcon={<Add />}
                  onClick={() => append({ sku: "", label: "", weightGrams: 0, priceDelta: 0, stockQuantity: 0, isActive: true })}
                  variant="outlined" sx={{ borderRadius: 0 }}
                >
                  Add Variant
                </Button>
              </Box>
              <Stack spacing={2}>
                {fields.map((field, index) => (
                  <Box key={field.id} sx={{ border: "1px solid var(--color-outline)", p: 2, position: "relative" }}>
                    <Box sx={{ position: "absolute", top: 8, right: 8 }}>
                      <IconButton size="small" color="error" onClick={() => remove(index)} disabled={fields.length === 1}>
                        <Delete fontSize="small" />
                      </IconButton>
                    </Box>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 6, sm: 3 }}>
                        <TextField
                          label="SKU" size="small" fullWidth
                          {...register(`variants.${index}.sku` as const)}
                          error={!!errors.variants?.[index]?.sku}
                        />
                      </Grid>
                      <Grid size={{ xs: 6, sm: 3 }}>
                        <TextField
                          label="Label (e.g. 100g Box)" size="small" fullWidth
                          {...register(`variants.${index}.label` as const)}
                          error={!!errors.variants?.[index]?.label}
                        />
                      </Grid>
                      <Grid size={{ xs: 4, sm: 2 }}>
                        <TextField
                          label="Weight (g)" type="number" size="small" fullWidth
                          {...register(`variants.${index}.weightGrams` as const, { valueAsNumber: true })}
                        />
                      </Grid>
                      <Grid size={{ xs: 4, sm: 2 }}>
                        <TextField
                          label="Price +" type="float" size="small" fullWidth
                          {...register(`variants.${index}.priceDelta` as const, { valueAsNumber: true })}
                        />
                      </Grid>
                      <Grid size={{ xs: 4, sm: 2 }}>
                        <TextField
                          label="Stock" type="number" size="small" fullWidth
                          {...register(`variants.${index}.stockQuantity` as const, { valueAsNumber: true })}
                        />
                      </Grid>
                    </Grid>
                  </Box>
                ))}
                {errors.variants && (
                  <Typography color="error" variant="caption">{errors.variants.message}</Typography>
                )}
              </Stack>
            </Box>
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Box sx={{ border: "1px solid var(--color-outline)", p: 3, position: "sticky", top: 20 }}>
            <Typography sx={{ fontFamily: "Montserrat", fontWeight: 600, mb: 2 }}>Publishing</Typography>
            <Box sx={{ mb: 3 }}>
              <Controller
                name="isActive"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth size="small">
                    <InputLabel>Status</InputLabel>
                    <Select value={field.value ? "active" : "inactive"} label="Status" onChange={(e) => field.onChange(e.target.value === "active")}>
                      <MenuItem value="active">Active</MenuItem>
                      <MenuItem value="inactive">Inactive</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
            </Box>
            <Stack spacing={2}>
              <Button
                fullWidth variant="contained" color="primary" type="submit" disabled={isLoading}
                sx={{ fontFamily: "Montserrat", fontWeight: 500, height: 48, borderRadius: 0, '&:hover': { bgcolor: 'primary.main', color: 'primary.contrastText' } }}
              >
                {isLoading ? "Saving..." : initialData ? "Update Product" : "Create Product"}
              </Button>
              <Button
                fullWidth variant="outlined" onClick={onCancel}
                sx={{ fontFamily: "Montserrat", fontWeight: 500, borderRadius: 0 }}
              >
                Cancel
              </Button>
            </Stack>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProductForm;
