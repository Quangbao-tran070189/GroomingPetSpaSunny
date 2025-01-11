const User = require('../models/User');

class AdminController {
  dashboard(req, res) {
    res.render('admin/dashboard', { user: req.user });
  }

  async listUsers(req, res) {
    try {
      const users = await User.find({});
      res.render('admin/users', { users, admin: req.user });
    } catch (err) {
      req.flash('error_msg', 'Unable to fetch users');
      res.redirect('/admin/dashboard');
    }
  }

  addUserPage(req, res) {
    res.render('admin/addUser');
  }

  async addUserHandle(req, res) {
    const { name, email, password, role } = req.body;
    let errors = [];

    if (!name || !email || !password || !role) {
      errors.push({ msg: 'Please fill in all fields' });
    }

    if (errors.length > 0) {
      res.render('admin/addUser', { errors, name, email, password, role });
    } else {
      try {
        let user = await User.findOne({ email: email });
        if (user) {
          errors.push({ msg: 'Email is already registered' });
          res.render('admin/addUser', { errors, name, email, password, role });
        } else {
          const newUser = new User({ name, email, password, role });
          await newUser.save();
          req.flash('success_msg', 'User added successfully');
          res.redirect('/admin/users');
        }
      } catch (err) {
        console.log(err);
        res.redirect('/admin/users');
      }
    }
  }

  async editUserPage(req, res) {
    try {
      const user = await User.findById(req.params.id);
      res.render('admin/editUser', { user });
    } catch (err) {
      req.flash('error_msg', 'Unable to fetch user');
      res.redirect('/admin/users');
    }
  }

  async editUserHandle(req, res) {
    const { name, email, role } = req.body;
    try {
      await User.findByIdAndUpdate(req.params.id, { name, email, role });
      req.flash('success_msg', 'User updated successfully');
      res.redirect('/admin/users');
    } catch (err) {
      req.flash('error_msg', 'Unable to update user');
      res.redirect('/admin/users');
    }
  }

  editAdminPage(req, res) {
    res.render('admin/editAdmin', { admin: req.user });
  }

  async editAdminHandle(req, res) {
    const { name, email, password } = req.body;
    try {
      let admin = await User.findById(req.user._id);
      admin.name = name;
      admin.email = email;
      if (password) {
        admin.password = password;  // Không mã hóa mật khẩu
      }
      await admin.save();
      req.flash('success_msg', 'Thông tin admin đã được cập nhật thành công');
      res.redirect('/admin/users');
    } catch (err) {
      req.flash('error_msg', 'Không thể cập nhật thông tin admin');
      res.redirect('/edit');
    }
  }

  async deleteUserHandle(req, res) {
    try {
      await User.findByIdAndRemove(req.params.id);
      req.flash('success_msg', 'User deleted successfully');
      res.redirect('/admin/users');
    } catch (err) {
      req.flash('error_msg', 'Unable to delete user');
      res.redirect('/admin/users');
    }
  }
}

module.exports = new AdminController();
