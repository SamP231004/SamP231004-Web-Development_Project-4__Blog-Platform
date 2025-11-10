import React, { useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button, Input, RTE, Select } from "..";
import appwriteService from "../../appwrite/config";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

export default function PostForm({ post }) {
    const {
        register,
        handleSubmit,
        watch,
        setValue,
        control,
        getValues,
        formState: { errors },
    } = useForm({
        defaultValues: {
            title: post?.title || "",
            slug: post?.slug || post?.$id || "",
            content: post?.Content || post?.content || "",
            status: post?.status || "active",
        },
    });

    const navigate = useNavigate();
    const userData = useSelector((state) => state.auth.userData);

    const submit = async (data) => {
        try {
            console.log("Submitting data:", data);
            console.log("Post object:", post);

            const fileList = data.image && data.image.length ? data.image : null;
            const fileProvided = fileList && fileList[0];

            if (post) {
                let uploadedFile = null;
                if (fileProvided) {
                    uploadedFile = await appwriteService.uploadFile(fileList[0]);
                    if (uploadedFile && post.featuredImage) {
                        try {
                            await appwriteService.deleteFile(post.featuredImage);
                        } 
                        catch (err) {
                            console.warn("Failed to delete previous featured image:", err);
                        }
                    }
                }

                const dbPost = await appwriteService.updatePost(post.$id, {
                    title: data.title,
                    slug: data.slug,
                    Content: data.content,
                    status: data.status,
                    featuredImage: uploadedFile ? uploadedFile.$id : post.featuredImage,
                });

                if (dbPost) {
                    navigate(`/post/${dbPost.$id}`);
                }
                return;
            }

            let uploadedFile = null;
            if (fileProvided) {
                uploadedFile = await appwriteService.uploadFile(fileList[0]);
            }

            const payload = {
                title: data.title,
                slug: data.slug,
                Content: data.content,
                status: data.status,
                featuredImage: uploadedFile ? uploadedFile.$id : undefined,
            };

            if (userData && userData.$id) {
                payload.userID = userData.$id;
            } 
            else {
                console.warn("No userData available; creating post without userID");
            }

            const dbPost = await appwriteService.createPost(payload);
            if (dbPost) {
                navigate(`/post/${dbPost.$id}`);
            }
        } 
        catch (err) {
            console.error("Error submitting post:", err);
        }
    };

    const slugTransform = useCallback((value) => {
        if (value && typeof value === "string")
            return value
                .trim()
                .toLowerCase()
                .replace(/[^a-zA-Z\d\s]+/g, "-")
                .replace(/\s+/g, "-");
        return "";
    }, []);

    useEffect(() => {
        const subscription = watch((value, { name }) => {
            if (name === "title") {
                setValue("slug", slugTransform(value.title || ""), { shouldValidate: true });
            }
        });

        return () => {
            if (subscription && typeof subscription.unsubscribe === "function") {
                subscription.unsubscribe();
            }
        };
    }, [watch, slugTransform, setValue]);

    return (
        <form className="formContainer" onSubmit={handleSubmit(submit)}>
            <div className="formInput">
                <Input
                    label="Title :"
                    placeholder="Title"
                    {...register("title", { required: true })}
                />
                <Input
                    label="Slug :"
                    placeholder="Slug"
                    {...register("slug", { required: true })}
                    onInput={(e) => {
                        setValue("slug", slugTransform(e.currentTarget.value), { shouldValidate: true });
                    }}
                />
            </div>

            <div className="formContent">
                <RTE label="Content :" name="content" control={control} defaultValue={getValues("content")} />
            </div>

            <div className="formRest">
                <Input
                    label="Featured Image :"
                    type="file"
                    accept="image/png, image/jpg, image/jpeg, image/gif"
                    {...register("image")}
                />
                {post?.featuredImage && (
                    <div>
                        <img src={appwriteService.getFileView(post.featuredImage)} alt={post.title} />
                    </div>
                )}
                <Select
                    className="formActive"
                    options={["active", "inactive"]}
                    label="Status"
                    {...register("status", { required: true })}
                />
                <Button className="formButton" type="submit">
                    {post ? "Update" : "Submit"}
                </Button>
            </div>

            {errors.title && <div className="error">Title is required</div>}
            {errors.slug && <div className="error">Slug is required</div>}
        </form>
    );
}