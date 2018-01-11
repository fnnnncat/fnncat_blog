var Post = require('../lib/mongo').Post;
module.exports = {
    getpigeList: function getpigeList() {
        var query = {};
        return Post
            .find(query)
            .sort({ creat_time: -1, _id: -1 })
            .addCreatedAt()
            .addCommentsCount()
            .contentToHtml()
            .exec();
    }
}