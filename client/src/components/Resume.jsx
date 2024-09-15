import React, { useRef } from "react";
import ErrorPage from "./ErrorPage";
import { useReactToPrint } from "react-to-print";
import ReactMarkdown from "react-markdown";

const Resume = ({ result }) => {
  const componentRef = useRef();

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: `${result.fullName} Resume`,
    onAfterPrint: () => alert("Print Successful!"),
  });

  if (JSON.stringify(result) === "{}") {
    return <ErrorPage />;
  }

  return (
    <>
      <button onClick={handlePrint}>Print Page</button>
      <main className="container" ref={componentRef}>
        <header className="header">
          <div>
            <h1>{result.fullName}</h1>
            <p className="resumeTitle headerTitle">
              {result.currentPosition} ({result.currentTechnologies})
            </p>
            <p className="resumeTitle">
              {result.currentLength} year(s) work experience
            </p>
          </div>
          <div>
            <img
              src={result.image_url}
              alt={result.fullName}
              className="resumeImage"
            />
          </div>
        </header>
        <div className="resumeBody">
          <div>
            <h2 className="resumeBodyTitle">PROFILE SUMMARY</h2>
            <ReactMarkdown className="resumeBodyContent">
              {result.objective}
            </ReactMarkdown>
          </div>
          <div>
            <h2 className="resumeBodyTitle">WORK HISTORY</h2>
            {result.workHistory.map((work) => (
              <p className="resumeBodyContent" key={work.name}>
                <span style={{ fontWeight: "bold" }}>{work.name}</span> - {work.position}
              </p>
            ))}
          </div>
          <div>
            <h2 className="resumeBodyTitle">JOB PROFILE</h2>
            <ReactMarkdown className="resumeBodyContent">
              {result.jobResponsibilities}
            </ReactMarkdown>
          </div>
          <div>
            <h2 className="resumeBodyTitle">JOB RESPONSIBILITIES</h2>
            <ReactMarkdown className="resumeBodyContent">
              {result.keypoints}
            </ReactMarkdown>
          </div>
        </div>
      </main>
    </>
  );
};

export default Resume;
