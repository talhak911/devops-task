import React, { useState } from "react";
import {
  Box, Button, Stack, TextField, Alert, Switch, FormControlLabel, Typography, IconButton
} from "@mui/material";
import { CloudUpload, Close } from "@mui/icons-material";
import { useForm, Controller, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { compressImage } from "../../../utils/imageCompression";

const categorySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: z.string(),
  isActive: z.boolean(),
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface CategoryFormProps {
  initialData?: {
    name: string;
    slug: string;
    isActive: boolean;
    imageUrl?: string;
  };
  onSubmit: (data: FormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const CategoryForm: React.FC<CategoryFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>(initialData?.imageUrl || "");
  const [error, setError] = useState("");

  const { control, handleSubmit, register, formState: { errors } } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: initialData?.name || "",
      slug: initialData?.slug || "",
      isActive: initialData?.isActive ?? true,
    }
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      try {
        const compressed = selectedFile.size > 200 * 1024
          ? await compressImage(selectedFile, 1000, 1000, 0.7)
          : selectedFile;
        setFile(compressed);
        setPreview(URL.createObjectURL(compressed));
      } catch (err) {
        console.error("Compression failed", err);
        setFile(selectedFile);
        setPreview(URL.createObjectURL(selectedFile));
      }
    }
  };

  const onFormSubmit: SubmitHandler<CategoryFormData> = async (data) => {
    setError("");
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("slug", data.slug || "");
    formData.append("isActive", String(data.isActive));
    if (file) {
      formData.append("image", file);
    }

    try {
      await onSubmit(formData);
    } catch (e: any) {
      setError(e.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onFormSubmit)}>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Stack spacing={2.5}>
        <Box sx={{ textAlign: "center" }}>
          <Box
            sx={{
              width: "100%", height: 160, mb: 1, border: "1px dashed var(--color-outline)",
              display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden",
              position: "relative",
              backgroundImage: preview ? `url(${preview})` : "none",
              backgroundSize: "cover", backgroundPosition: "center"
            }}
          >
            {!preview && <CloudUpload sx={{ fontSize: 48, color: "text.disabled" }} />}
            {preview && (
              <IconButton
                size="small"
                onClick={() => { setFile(null); setPreview(""); }}
                sx={{ position: "absolute", top: 8, right: 8, bgcolor: "rgba(255,255,255,0.8)", "&:hover": { bgcolor: "white" } }}
              >
                <Close fontSize="small" />
              </IconButton>
            )}
          </Box>
          <Button component="label" variant="outlined" size="small" sx={{ fontFamily: "Montserrat", borderRadius: 0 }}>
            {preview ? "Change Image" : "Upload Image"}
            <input type="file" hidden accept="image/*" onChange={handleFileChange} />
          </Button>
        </Box>

        <TextField
          label="Category Name"
          fullWidth size="small"
          {...register("name")}
          error={!!errors.name}
          helperText={errors.name?.message}
        />

        <TextField
          label="Slug (optional)"
          fullWidth size="small"
          {...register("slug")}
          placeholder="e.g. green-teas"
          helperText="If empty, it will be generated from name"
        />

        <Controller
          name="isActive"
          control={control}
          render={({ field }) => (
            <FormControlLabel
              control={<Switch checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />}
              label={<Typography sx={{ fontFamily: "Montserrat", fontSize: "14px" }}>Active Visibility</Typography>}
            />
          )}
        />

        <Stack direction="row" spacing={2} sx={{ mt: 1, pt: 2, borderTop: "1px solid var(--color-outline)" }}>
          <Button fullWidth variant="outlined" onClick={onCancel} disabled={isLoading} sx={{ borderRadius: 0, fontFamily: "Montserrat" }}>
            Cancel
          </Button>
          <Button
            fullWidth
            type="submit"
            variant="contained"
            disabled={isLoading}
            sx={{ bgcolor: "primary.main", fontFamily: "Montserrat", borderRadius: 0 }}
          >
            {isLoading ? "Saving..." : "Save Category"}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};

export default CategoryForm;
