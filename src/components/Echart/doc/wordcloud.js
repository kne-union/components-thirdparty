const { default: Echart } = _Echart;

const SKILL_COLORS = {
  skill: '#10b981',
  completeness: '#9333ea',
  coherence: '#ef4444',
  bloom: '#fb923c',
  competency: '#10b981'
};

const WordCloudExample = () => {
  const data = [
    { name: 'Java', value: 300, color: SKILL_COLORS.skill, fontWeight: 600 },
    { name: 'Python', value: 220, color: SKILL_COLORS.skill, fontWeight: 600 },
    { name: 'React', value: 180, color: SKILL_COLORS.skill, fontWeight: 600 },
    { name: '算法', value: 160, color: SKILL_COLORS.skill, fontWeight: 600 },
    { name: 'Java·完整度', value: 42, color: SKILL_COLORS.completeness },
    { name: 'Java·连贯性', value: 38, color: SKILL_COLORS.coherence },
    { name: 'Java·深度', value: 55, color: SKILL_COLORS.bloom },
    { name: 'Java·胜任力', value: 72, color: SKILL_COLORS.competency },
    { name: 'Python·完整度', value: 36, color: SKILL_COLORS.completeness },
    { name: 'Python·深度', value: 48, color: SKILL_COLORS.bloom },
    { name: 'React·胜任力', value: 60, color: SKILL_COLORS.competency },
    { name: 'MySQL', value: 120, color: SKILL_COLORS.skill, fontWeight: 600 },
    { name: '沟通', value: 90, color: SKILL_COLORS.skill, fontWeight: 600 }
  ];

  return <Echart.WordCloud style={{ height: '320px' }} data={data} sizeRange={[14, 42]} />;
};

render(<WordCloudExample />);
