import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import appwriteService from "../appwrite/config";
import { Button, Container } from "../components";
import parse from "html-react-parser";
import { useSelector } from "react-redux";

export default function Post() {
    const [post, setPost] = useState(null);
    const { slug } = useParams();
    const navigate = useNavigate();

    const userData = useSelector((state) => state.auth.userData);

    const isAuthor = post && userData ? post.userID === userData.$id : false;

    useEffect(() => {
        if (slug) {
            appwriteService.getPost(slug).then((post) => {
                if (post) setPost(post);
                else navigate("/");
            });
        } else navigate("/");
    }, [slug, navigate]);

    const deletePost = () => {
        appwriteService.deletePost(post.$id).then((status) => {
            if (status) {
                appwriteService.deleteFile(post.featuredImage);
                navigate("/");
            }
        });
    };

    return post ? (
        <div className="PostContainer">
            {/* <Container> */}
                <div className="PostImageContainer">
                    <img src={appwriteService.getFileView(post.featuredImage)} alt={post.title} />

                    {isAuthor && (
                        <div>
                            <Link to={`/edit-post/${post.$id}`}>
                                <Button className={`postButton`}>
                                    Edit
                                </Button>
                            </Link>
                            <Button className={`postButton`} onClick={deletePost}>
                                Delete
                            </Button>
                        </div>
                    )}
                </div>
                <div className="PostText">
                    <div>
                        <h1>{post.title}</h1>
                    </div>
                    <div>
                        {parse(post.Content)}
                    </div>
                </div>
            {/* </Container> */}
        </div>
    ) : null;
}