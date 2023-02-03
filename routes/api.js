'use strict';
const Db = require("../db.js").Database;
const Issue = require("../model").Issue;
module.exports = function (app) {

  app.route('/api/issues/:project')

    .get(async function (req, res) {
      let project = req.params.project;
      Db._connect();
      const issueQuery = { project: project, ...req.query };
      const allIssues = await Issue
        .find(issueQuery)
        .select('-__v -project');
      return res.json(allIssues);
    })

    .post(async function (req, res) {
      let project = req.params.project;

      let params = {
        issue_title: req.body.issue_title, //*
        issue_text: req.body.issue_text, //*
        status_text: req.body.status_text,
        created_by: req.body.created_by,  //*
        assigned_to: req.body.assigned_to,
        project: project
      }
      if (!req.body.issue_title || !req.body.issue_text || !req.body.created_by) {
        return res.json({ error: 'required field(s) missing' });
      } else {
        params.status_text = req.body.status_text || "";
        params.assigned_to = req.body.assigned_to || "";
        Db._connect();
        const result = await Issue.createIssueInDb(params);
        res.json({
          assigned_to: result.assigned_to,
          status_text: result.status_text,
          open: result.open,
          _id: result._id,
          issue_title: result.issue_title,
          issue_text: result.issue_text,
          created_by: result.created_by,
          created_on: result.created_on,
          updated_on: result.updated_on
        })
      }
    })

    .put(async function (req, res) {
      let project = req.params.project;
      const id = req.body._id;
      let params = {
        issue_title: req.body.issue_title, //*
        issue_text: req.body.issue_text, //*
        status_text: req.body.status_text,
        created_by: req.body.created_by,  //*
        assigned_to: req.body.assigned_to,
      }
      Db._connect();
      if (!id) {
        res.json({ error: 'missing _id' });
      } else {
        if (Object.entries(req.body).length == 1 && (typeof req.body._id != "undefined")) {
          res.json({ error: 'no update field(s) sent', '_id': id });
        } else {
          try {
            const obj = Object.fromEntries(Object.entries(params).map(([key, val]) => [key, val || ""]));
            if (req.body.open != undefined) { obj.open = req.body.open };
            let issue = await Issue.findOne({ _id: id });
            if (issue.project != project) {
              throw new Error("different project");
            }
            obj.updated_on = Date.now();
            const _resp = await Issue.findOneAndUpdate(
              { _id: id },
              obj,
              { new: true }
            );
            res.json({ result: 'successfully updated', _id: id });
          }
          catch (e) {
            //console.log(e)
            res.json({ error: 'could not update', '_id': id })
          }
        }
      }
    })

    .delete(async function (req, res) {
      let project = req.params.project;
      if (!req.body._id) {
        res.json({ error: 'missing _id' });
      } else {
        Issue
          .findOneAndRemove({
            _id: req.body._id
          })
          .then(response => {
            res.json({ result: 'successfully deleted', '_id': response._id })
          })
          .catch(err => {
            //console.error(err)
            res.json({ error: 'could not delete', '_id': req.body._id })
          })
      }
    });

};
