export const getChatHistory = async (req, res) => {
  try {
    const { bookId } = req.params;
    const history = await ChatMessage.findAll({
      where: { bookId },
      include: [{ model: User, as: 'sender', attributes: ['nama'] }],
      order: [['createdAt', 'ASC']],
      limit: 50
    });
    res.status(200).json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};