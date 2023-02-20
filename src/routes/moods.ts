const getMoods = (req: Express.Request) => {
  return [
    {
      key: "uncertain",
      value: req.t("moods.uncertain"),
    },
    {
      key: "banger",
      value: req.t("moods.banger"),
    },
    {
      key: "happy",
      value: req.t("moods.happy"),
    },
    {
      key: "deep",
      value: req.t("moods.deep"),
    },
    {
      key: "emotional",
      value: req.t("moods.emotional"),
    },
    {
      key: "sad",
      value: req.t("moods.sad"),
    },
  ];
};

export { getMoods };
