import React from "react";
import { Link } from "react-router-dom";
import { BookOpen } from "lucide-react";

const BlogCard = ({ blog }) => {
  if (!blog) {
    return null;
  }

  const {
    id,
    title = "Skin Care Guide",
    description = "Learn useful information about maintaining healthy-looking skin.",
    category = "Skin Care",
    author = "SkinSense",
    date = "25 Aug 2026",
    image = null,
    readTime = "5 min read",
  } = blog;

  return (
    <div className="card border-0 shadow-sm h-100 overflow-hidden">

      {/* Blog Image */}
      <div
        className="bg-success-subtle d-flex justify-content-center align-items-center"
        style={{
          height: "200px",
        }}
      >

        {image ? (
          <img
            src={image}
            alt={title}
            className="w-100 h-100"
            style={{
              objectFit: "cover",
            }}
          />
        ) : (
          <div
            className="rounded-circle bg-white shadow-sm d-flex justify-content-center align-items-center"
            style={{
              width: "90px",
              height: "90px",
              fontSize: "40px",
            }}
          >
            <BookOpen size={40} className="text-success" />
          </div>
        )}

      </div>

      {/* Blog Content */}
      <div className="card-body p-4 d-flex flex-column">

        {/* Category */}
        <div className="mb-2">

          <span className="badge bg-success-subtle text-success">
            {category}
          </span>

        </div>

        {/* Title */}
        <h5 className="fw-bold mb-2">
          {title}
        </h5>

        {/* Description */}
        <p className="text-muted small mb-3">
          {description}
        </p>

        {/* Author and Date */}
        <div className="d-flex justify-content-between align-items-center mb-3">

          <small className="text-muted">
            By {author}
          </small>

          <small className="text-muted">
            {date}
          </small>

        </div>

        {/* Bottom */}
        <div className="d-flex justify-content-between align-items-center mt-auto">

          <small className="text-muted">
            {readTime}
          </small>

          <Link
            to={`/blog/${id}`}
            className="btn btn-outline-success btn-sm"
          >
            Read More
          </Link>

        </div>

      </div>

    </div>
  );
};

export default BlogCard;