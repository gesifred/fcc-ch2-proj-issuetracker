const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function () {
    test('Test GET /hello with no name', function (done) {
        chai
            .request(server)
            .get('/')
            .end(function (err, res) {
                assert.equal(res.status, 200);
                done();
            });
    });

    test('Create an issue with every field: POST request to /api/issues/{project}',
        function () {
            chai.request(server)
                .post('/api/issues/apitest')
                .send({
                    issue_title: "title", //*
                    issue_text: "text", //*
                    created_by: "created_by",  //*
                    status_text: "status_text",
                    assigned_to: "assigned_to",
                })
                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    assert.equal(res.body.issue_title, 'title');
                    assert.equal(res.body.issue_text, 'text');
                    assert.equal(res.body.created_by, 'created_by');
                    assert.equal(res.body.assigned_to, 'assigned_to');
                    assert.equal(res.body.status_text, 'status_text');
                    id1 = res.body._id;
                });
        });

    test('Create an issue with only required fields: POST request to /api/issues/{project}',
        function () {
            chai.request(server)
                .post('/api/issues/apitest')
                .send({
                    issue_title: "title", //*
                    issue_text: "text", //*
                    created_by: "created_by",  //*
                })
                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    assert.equal(res.body.issue_title, 'title');
                    assert.equal(res.body.issue_text, 'text');
                    assert.equal(res.body.created_by, 'created_by');
                });
        });

    test('Create an issue with missing required fields: POST request to /api/issues/{project}',
        function () {
            chai.request(server)
                .post('/api/issues/apitest')
                .send({
                    issue_status: "status_none", //*
                })
                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    assert.equal(res.body.error, 'required field(s) missing');
                });
        });

    test('View issues on a project: GET request to /api/issues/{project}',
        function () {
            chai.request(server)
                .get('/api/issues/apitest')
                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    assert.isArray(res.body);
                    assert.property(res.body[0], "issue_title");
                    assert.hasAllKeys(
                        res.body[0],
                        ["issue_title",
                            "issue_text",
                            "created_by",
                            "assigned_to",
                            "status_text",
                            "_id",
                            "created_on",
                            "updated_on",
                            "open"]
                    )
                });
        });

    test('View issues on a project with one filter: GET request to /api/issues/{project}',
        function () {
            chai.request(server)
                .get('/api/issues/apitest?open=true')
                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    res.body.forEach(el => {
                        assert.equal(el.open, true);
                    });
                });
        });

    test('View issues on a project with multiple filters: GET request to /api/issues/{project}',
        function () {
            chai.request(server)
                .get('/api/issues/apitest?open=true&issue_title=title')
                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    res.body.forEach(el => {
                        assert.equal(el.open, true);
                        assert.equal(el.issue_title, "title");
                    });
                });
        });

    test('Update one field on an issue: PUT request to /api/issues/{project}',
        function () {
            chai.request(server)
                .get('/api/issues/apitest')
                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    let id = res.body[0]._id;
                    chai.request(server)
                        .put('/api/issues/apitest')
                        .send({
                            _id: id,
                            issue_title: "title_new", //*
                        })
                        .end(function (err, res) {
                            assert.equal(res.status, 200);
                            assert.equal(res.body.result, 'successfully updated');
                        });
                });

        });

    test('Update multiple fields on an issue: PUT request to /api/issues/{project}',
        function () {
            chai.request(server)
                .get('/api/issues/apitest')
                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    let id = res.body[0]._id;
                    chai.request(server)
                        .put('/api/issues/apitest')
                        .send({
                            _id: id,
                            issue_title: "title_new_multiple", //*
                            status_text: "text_new_multiple"
                        })
                        .end(function (err, res) {
                            assert.equal(res.status, 200);
                            assert.equal(res.body.result, 'successfully updated');
                        });
                });
        });

    test('Update an issue with missing _id: PUT request to /api/issues/{project}',
        function () {
            chai.request(server)
                .put('/api/issues/apitest')
                .send({
                })
                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    assert.equal(res.body.error, 'missing _id');
                });
        });

    test('Update an issue with no fields to update: PUT request to /api/issues/{project}',
        function () {
            chai.request(server)
                .get('/api/issues/apitest')
                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    let id = res.body[0]._id;
                    chai.request(server)
                        .put('/api/issues/apitest')
                        .send({
                            _id: id,
                        })
                        .end(function (err, res) {
                            assert.equal(res.status, 200);
                            assert.equal(res.body.error, 'no update field(s) sent');
                            assert.equal(res.body._id, id);
                        });
                });
        });

    test('Update an issue with an invalid _id: PUT request to /api/issues/{project}',
        function () {
            chai.request(server)
                .put('/api/issues/apitest')
                .send({
                    _id: 123,
                    status_text: "text_new_multiple"
                })
                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    assert.equal(res.body.error, 'could not update');
                    assert.equal(res.body._id, 123);
                });
        });

    test('Delete an issue: DELETE request to /api/issues/{project}',
        function () {
            chai.request(server)
                .get('/api/issues/apitest')
                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    let id = res.body[0]._id;
                    chai.request(server)
                        .delete('/api/issues/apitest')
                        .send({
                            _id: id,
                        })
                        .end(function (err, res) {
                            assert.equal(res.status, 200);
                            assert.equal(res.body.result, 'successfully deleted');
                            assert.equal(res.body._id, id);
                        });
                });
        });

    test('Delete an issue with an invalid _id: DELETE request to /api/issues/{project}',
        function () {
            chai.request(server)
                .delete('/api/issues/apitest')
                .send({
                    _id: 123,
                })
                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    assert.equal(res.body.error, 'could not delete');
                });
        });

    test('Delete an issue with missing _id: DELETE request to /api/issues/{project}',
        function () {
            chai.request(server)
                .delete('/api/issues/apitest')
                .send({
                })
                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    assert.equal(res.body.error, 'missing _id');
                });
        });
});
