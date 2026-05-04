const UserService = require('../services/user.service');
const User = require('../models/user.model');
const redisClient = require('../database/redis');
const { AppError } = require('../middleware/errorHandler');

class UserController {
  static async register(req, res, next) {
    try {
      const { name, username, email, phone, password } = req.body;
      const user = await UserService.register({ name, username, email, phone, password });
      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        payload: user,
      });
    } catch (error) {
      next(error);
    }
  }

  static async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const { token, user } = await UserService.login(email, password);
      res.status(200).json({
        success: true,
        message: 'Login successful',
        payload: user,
      });
    } catch (error) {
      next(error);
    }
  }

  // Task 2 — Cache-Aside: GET /user/:email
  static async getUserByEmail(req, res, next) {
    const { email } = req.params;
    const cacheKey = `user:${email}`;

    try {
      // 1. Check Redis cache first
      const cached = await redisClient.get(cacheKey);

      if (cached) {
        // Cache Hit — return data straight from Redis
        return res.status(200).json({
          success: true,
          message: 'User retrieved from cache (cache hit)',
          source: 'cache',
          payload: JSON.parse(cached),
        });
      }

      // Cache Miss — fetch from PostgreSQL
      const user = await User.findByEmail(email);
      if (!user) {
        return next(new AppError('User not found', 404));
      }

      // Strip sensitive fields before caching
      const safeUser = {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        phone: user.phone,
        balance: user.balance,
        created_at: user.created_at,
      };

      // Store in Redis with EX of 60 seconds
      await redisClient.setEx(cacheKey, 60, JSON.stringify(safeUser));

      return res.status(200).json({
        success: true,
        message: 'User retrieved from database (cache miss)',
        source: 'database',
        payload: safeUser,
      });
    } catch (error) {
      next(error);
    }
  }

  // Task 3 — Cache Invalidation: PUT /user/update
  static async updateProfile(req, res, next) {
    try {
      const { id, name, username, email, phone, password, balance } = req.body;

      // Fetch old email BEFORE update so we can invalidate the correct cache key
      const existingUser = await User.findById(id);
      if (!existingUser) {
        return next(new AppError('User not found', 404));
      }
      const oldEmail = existingUser.email;

      const updatedUser = await UserService.updateProfile(id, { name, username, email, phone, password, balance });

      // Cache Invalidation — delete stale key from Redis after successful DB update
      await redisClient.del(`user:${oldEmail}`);
      console.log(`[Redis] Cache invalidated for key: user:${oldEmail}`);

      // If email was changed, also remove the new email key (defensive clean-up)
      if (email && email !== oldEmail) {
        await redisClient.del(`user:${email}`);
        console.log(`[Redis] Cache invalidated for key: user:${email}`);
      }

      res.status(200).json({
        success: true,
        message: 'User updated successfully',
        payload: updatedUser,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getTransactionHistory(req, res, next) {
    try {
      const userId = req.user.userId;
      const history = await UserService.getTransactionHistory(userId);
      res.status(200).json({
        success: true,
        message: 'Transaction history retrieved',
        payload: history,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getTotalSpent(req, res, next) {
    try {
      const userId = req.user.userId;
      const totalSpent = await UserService.getTotalSpent(userId);
      res.status(200).json({
        success: true,
        message: 'Total spent retrieved',
        payload: { total_spent: totalSpent },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = UserController;
