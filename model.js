
const mongoose = require("mongoose");

mongoose.set('strictQuery', false);

const issueSchema = new mongoose.Schema({
    issue_title: { type: String, required: true },
    issue_text: { type: String, required: true },
    open: { type: Boolean, default: true },
    status_text: String,
    created_by: { type: String, required: true },
    assigned_to: String,
    created_on: { type: Date, default: Date.now },
    updated_on: { type: Date, default: Date.now },
    project: String

});
const Issue = mongoose.model('Issue', issueSchema);

Issue.createIssueInDb = async (params) => {
    const newIssue = new Issue({
        issue_title: params.issue_title,
        issue_text: params.issue_text,
        open: true,
        status_text: params.status_text,
        created_by: params.created_by,
        assigned_to: params.assigned_to,
        created_on: Date.now(),
        updated_on: Date.now(),
        project: params.project
    });
    return newIssue.save()
        .then(doc => {
            //console.log(doc)
            return doc
        })
        .catch(err => {
            console.error(err)
        })
}

exports.Issue = Issue;
