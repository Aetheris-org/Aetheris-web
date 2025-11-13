# Explore Section - Developer Guide

## 🎮 Overview

The **Explore** section is a comprehensive competitive gaming platform featuring:

- **Duels & Clan Wars** - 1v1 battles, team competitions, and epic clan wars
- **Leaderboards** - Rankings for individual players and clans across different time periods
- **Events** - Community tournaments, hackathons, challenges, and contests

## 📁 File Structure

```
frontend-react/src/
├── pages/
│   ├── ExplorePage.tsx           # Main Explore page with tabs
│   └── EventDetailPage.tsx       # Dynamic event detail page
├── types/
│   └── explore.ts                # TypeScript type definitions
├── data/
│   └── exploreMockData.ts        # Mock data for development
└── components/
    └── ui/                       # shadcn/ui components

EXPLORE_BACKEND_INTEGRATION.md    # Comprehensive backend integration guide
```

## 🚀 Features

### 1. Duels System

**Active Duels**
- Real-time score tracking
- Live status indicators
- Multiple difficulty levels (easy, medium, hard, expert)
- Various categories (Speed Coding, Algorithm Challenge, UI/UX Design, etc.)

**Pending Challenges**
- Open challenges waiting for opponents
- Accept/Decline functionality
- Time limits and point stakes

**Clan Wars**
- Multi-round battles between clans
- Best-of-3, Best-of-5, Tournament, and Points-Race formats
- Real-time round progress tracking

### 2. Leaderboards

**Types:**
- Users Leaderboard
- Clans Leaderboard
- Duels Leaderboard
- Clan Wars Leaderboard

**Time Periods:**
- All-Time
- Monthly
- Weekly
- Daily

**Features:**
- Rank change indicators (↑↓)
- Win rate statistics
- Achievement badges
- Clan affiliations

### 3. Events

**Event Types:**
- Tournaments
- Hackathons
- Challenges
- Contests
- Community Events

**Features:**
- Event registration/unregistration
- Prize information
- Requirements and restrictions
- Participant tracking
- Progress bars for registration limits
- Event detail pages with tabs (Participants, Discussion)

### 4. User Stats Card

Displays:
- Level and Rank
- Rating
- Total Points
- Win/Loss statistics
- Win Rate
- Current Streak
- Clan affiliation

## 🎨 UI/UX Features

### Responsive Design
- Mobile-first approach
- Adaptive layouts for all screen sizes
- Touch-friendly interactions

### Visual Feedback
- Hover effects on cards
- Active state indicators
- Loading states (ready for API integration)
- Empty state placeholders

### Animations
- Smooth transitions
- Pulse animations for live duels
- Progress bars
- Badge animations

### Color Coding
- Green for wins/active status
- Red for losses
- Yellow for pending/live
- Purple for secondary opponents
- Primary color for main actions

## 🔧 Technical Implementation

### State Management

```typescript
// Main tab state
const [mainTab, setMainTab] = useState<'duels' | 'leaderboards' | 'events'>('duels')

// Sub-tab states
const [duelTab, setDuelTab] = useState<'active' | 'pending' | 'clan-wars'>('active')
const [leaderboardType, setLeaderboardType] = useState<'users' | 'clans'>('users')
const [leaderboardPeriod, setLeaderboardPeriod] = useState<LeaderboardPeriod>('all-time')
const [eventFilter, setEventFilter] = useState<'all' | 'active' | 'upcoming' | 'completed'>('all')

// Search and filters
const [searchQuery, setSearchQuery] = useState('')
```

### Data Filtering

All data is filtered using `useMemo` for performance:

```typescript
const filteredDuels = useMemo(() => {
  let duels = mockDuels
  
  // Filter by tab
  if (duelTab === 'active') {
    duels = duels.filter(d => d.status === 'active')
  }
  
  // Filter by search
  if (searchQuery) {
    duels = duels.filter(d =>
      d.category.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }
  
  return duels
}, [duelTab, searchQuery])
```

### Navigation

```typescript
// Navigate to event detail page
navigate(`/explore/events/${event.id}`)

// Back to explore
navigate('/explore')
```

## 📊 Mock Data

Currently using mock data from `exploreMockData.ts`:

- `mockDuels` - Sample duel challenges
- `mockClanWars` - Sample clan wars
- `mockClans` - Sample clans
- `mockLeaderboards` - Sample leaderboard entries
- `mockEvents` - Sample events
- `mockAchievements` - Sample achievements
- `mockUserStats` - Sample user statistics

**⚠️ Important:** Replace with real API calls when backend is ready. See `EXPLORE_BACKEND_INTEGRATION.md` for detailed instructions.

## 🔌 Backend Integration

### Quick Start

1. **Read the integration guide:**
   ```
   EXPLORE_BACKEND_INTEGRATION.md
   ```

2. **Create Strapi Content Types:**
   - User Stats Extension
   - Clan
   - Duel Challenge
   - Clan War
   - Event
   - Achievement

3. **Implement API endpoints:**
   - `/api/explore/duels`
   - `/api/explore/clan-wars`
   - `/api/explore/clans`
   - `/api/explore/leaderboards/:type/:period`
   - `/api/explore/events`
   - `/api/explore/stats/:userId`

4. **Set up WebSocket for real-time updates:**
   - Duel score updates
   - Leaderboard changes
   - Event notifications

5. **Replace mock data:**
   - Create `frontend-react/src/api/explore.ts`
   - Implement React Query hooks
   - Update components to use API data

### API Service Example

```typescript
// frontend-react/src/api/explore.ts
import { apiClient } from './axios'
import type { DuelChallenge } from '@/types/explore'

export async function getDuels(filters?: {
  status?: string
  type?: string
  limit?: number
}): Promise<DuelChallenge[]> {
  const res = await apiClient.get('/api/explore/duels', { params: filters })
  return res.data.data.map(transformDuel)
}

export async function createDuel(data: CreateDuelBody): Promise<DuelChallenge> {
  const res = await apiClient.post('/api/explore/duels', data, {
    headers: { 'X-Require-Auth': 'true' }
  })
  return transformDuel(res.data.data)
}
```

## 🎯 Future Enhancements

### Phase 1 (Core Functionality)
- [ ] Backend API integration
- [ ] Real-time WebSocket updates
- [ ] User authentication for actions
- [ ] Rating calculation system
- [ ] Achievement system

### Phase 2 (Enhanced Features)
- [ ] Duel spectator mode
- [ ] Clan management dashboard
- [ ] Event creation by community
- [ ] Advanced filtering and sorting
- [ ] Notification system

### Phase 3 (Advanced Features)
- [ ] Replay system for duels
- [ ] Clan chat
- [ ] Event streaming
- [ ] Betting system (with virtual currency)
- [ ] Custom tournaments
- [ ] Analytics dashboard

## 🐛 Known Issues / Limitations

1. **Mock Data Only:** Currently using static mock data. No persistence.
2. **No Real-time Updates:** WebSocket not implemented yet.
3. **No Authentication:** All actions are UI-only, no backend validation.
4. **No Pagination:** Showing all data at once (will need pagination with real data).
5. **Limited Search:** Basic string matching only.

## 🧪 Testing

### Manual Testing Checklist

- [ ] Navigate between Duels/Leaderboards/Events tabs
- [ ] Filter duels by status (active/pending/clan-wars)
- [ ] Search for duels, events, clans
- [ ] Switch leaderboard types and periods
- [ ] Click on event to view details
- [ ] Test on mobile devices
- [ ] Test dark/light theme compatibility
- [ ] Verify all accent colors work correctly

### Automated Testing (TODO)

```typescript
// Example test
describe('ExplorePage', () => {
  it('should render all main tabs', () => {
    render(<ExplorePage />)
    expect(screen.getByText('Duels & Wars')).toBeInTheDocument()
    expect(screen.getByText('Leaderboards')).toBeInTheDocument()
    expect(screen.getByText('Events')).toBeInTheDocument()
  })
  
  it('should filter duels by search query', () => {
    // Test implementation
  })
})
```

## 📚 Resources

- **Strapi Documentation:** https://docs.strapi.io
- **shadcn/ui Components:** https://ui.shadcn.com
- **React Router:** https://reactrouter.com
- **Socket.io:** https://socket.io/docs

## 🆘 Support

For questions or issues:
1. Check `EXPLORE_BACKEND_INTEGRATION.md` for backend setup
2. Review existing API patterns in `frontend-react/src/api/`
3. Refer to shadcn/ui documentation for component usage
4. Check TypeScript types in `frontend-react/src/types/explore.ts`

---

**Built with ❤️ using shadcn/ui and modern React patterns**

