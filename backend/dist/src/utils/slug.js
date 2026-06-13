import slugify from "slugify";
export function toSlug(value) {
    return slugify(value, { lower: true, strict: true, trim: true });
}
