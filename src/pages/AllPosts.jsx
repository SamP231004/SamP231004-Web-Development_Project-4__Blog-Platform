import React, { useState, useEffect } from "react";
import { Container, PostCard } from "../components";
import appwriteService from "../appwrite/config";
import { Query } from "appwrite";

function AllPosts() {
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        appwriteService
            .getPosts([Query.orderDesc("$createdAt")])
            .then((res) => {
                if (res?.documents) {
                    setPosts(res.documents);
                }
            })
            .catch((err) => console.error("Error fetching posts:", err));
    }, []);

    return (
        <div>
            <Container>
                <div className="postContainer">
                    {posts.map((post) => (
                        <div className="post" key={post.$id}>
                            <PostCard {...post} />
                        </div>
                    ))}
                </div>
            </Container>
        </div>
    );
}

export default AllPosts;